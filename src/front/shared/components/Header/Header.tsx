import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'

import links from 'helpers/links'
import actions from 'redux/actions'
import { constants } from 'helpers'
import config from 'helpers/externalConfig'
import { injectIntl, FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import NavMobile from './NavMobile/NavMobile'

import Logo from './Logo/Logo'
import TourPartial from './TourPartial/TourPartial'
import WalletTour from './WalletTour/WalletTour'
import { WidgetWalletTour } from './WidgetTours'

import Loader from 'components/loaders/Loader/Loader'
import { localisedUrl } from '../../helpers/locale'
import { messages, getMenuItems, getMenuItemsMobile } from './config'
import { getActivatedCurrencies } from 'helpers/user'
import { ThemeSwitcher } from './ThemeSwitcher'

// Incoming swap requests and tooltips (revert)
import UserTooltip from 'components/Header/UserTooltip/UserTooltip'
import feedback from 'shared/helpers/feedback'
import wpLogoutModal from 'helpers/wpLogoutModal'


import Swap from 'swap.swap'
import SwapApp from 'swap.app'

/* uncomment to debug */
//window.isUserRegisteredAndLoggedIn = true

const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'pubsubRoom.peer',
  isInputActive: 'inputActive.isInputActive',
  reputation: 'pubsubRoom.reputation',
  modals: 'modals',
  hiddenCoinsList: 'core.hiddenCoinsList',
})
@CSSModules(styles, { allowMultiple: true })
class Header extends Component<any, any> {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  static getDerivedStateFromProps({
    history: {
      location: { pathname },
    },
  }) {
    if (pathname === '/ru' || pathname === '/' || pathname === links.wallet) {
      return { path: true }
    }
    return { path: false }
  }

  lastScrollTop: any

  constructor(props) {
    super(props)

    const {
      location: { pathname },
      intl,
    } = props
    const { exchange, home, wallet } = links
    const { isWalletCreate } = constants.localStorage

    const dynamicPath = pathname.includes(exchange) ? `${pathname}` : `${home}`
    //@ts-ignore: strictNullChecks
    let lsWalletCreated: string | boolean = localStorage.getItem(isWalletCreate)
    if (config && config.isWidget) {
      lsWalletCreated = true
    }

    const isWalletPage = pathname === wallet || pathname === `/ru${wallet}`

    this.state = {
      isPartialTourOpen: false,
      path: false,
      isTourOpen: false,
      isWallet: false,
      menuItems: getMenuItems(props),
      menuItemsMobile: getMenuItemsMobile(props, lsWalletCreated, dynamicPath),
      createdWalletLoader: isWalletPage && !lsWalletCreated,
    }
    this.lastScrollTop = 0
  }

  componentDidMount() {
    this.handlerAsync()
  }

  handlerAsync = async () => {
    const { history } = this.props

    await this.tapCreateWalletButton()

    this.startTourAndSignInModal()

    history.listen(async (location) => {
      await this.tapCreateWalletButton({ location })

      this.startTourAndSignInModal({ location })
    })
  }

  tapCreateWalletButton = (customProps = {}) =>
    new Promise((resolve) => {
      const finishProps = { ...this.props, ...customProps }
      //@ts-ignore
      const { location, intl } = finishProps
      const { pathname } = location
      const { wallet, home } = links

      let isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

      if (config && config.isWidget) {
        //@ts-ignore
        isWalletCreate = true
      }

      const isWalletPage = pathname === wallet || pathname === `/ru${wallet}`

      if (isWalletPage && !isWalletCreate) {
        //@ts-ignore
        isWalletCreate = true

        this.setState(
          () => ({
            menuItems: getMenuItems(this.props),
            //@ts-ignore
            menuItemsMobile: getMenuItemsMobile(this.props, isWalletCreate),
            createdWalletLoader: true,
          }),
          () => {
            setTimeout(() => {
              this.setState(() => ({
                createdWalletLoader: false,
              }))
              resolve(true)
            }, 4000)
          }
        )
      } else {
        resolve(true)
      }
    })

  startTourAndSignInModal = (customProps = {}) => {
    const finishProps = { ...this.props, ...customProps }
    const { wasOnExchange, wasOnWallet, isWalletCreate, wasOnWidgetWallet } = constants.localStorage
    const {
      //@ts-ignore
      hiddenCoinsList,
      //@ts-ignore
      location: { hash, pathname },
    } = finishProps
    const { wallet, exchange, marketmaker, marketmaker_short } = links
    const isGuestLink = !(!hash || hash.slice(1) !== 'guest')

    if (isGuestLink) {
      localStorage.setItem(wasOnWallet, 'true')
      localStorage.setItem(wasOnExchange, 'true')
      localStorage.setItem(wasOnWidgetWallet, 'true')
      return
    }

    this.setState(() => ({
      menuItems: getMenuItems(this.props),
      //@ts-ignore
      menuItemsMobile: getMenuItemsMobile(this.props, true),
    }))

    const path = pathname.toLowerCase()
    const isWalletPage = path.includes(wallet) || path === `/` || path === '/ru'
    const isPartialPage = path.includes(exchange) || path === `/ru${exchange}`

    const isMarketPage = path.includes(marketmaker) || path.includes(marketmaker_short)
    const didOpenWalletCreate = localStorage.getItem(isWalletCreate)

    const wasOnWalletLs = localStorage.getItem(wasOnWallet)
    const wasOnExchangeLs = localStorage.getItem(wasOnExchange)
    const wasOnWidgetWalletLs = localStorage.getItem(wasOnWidgetWallet)

    let tourEvent = () => {}

    const allData = actions.core.getWallets({})

    const widgetCurrencies = ['BTC', 'ETH']
    const optionsalCur = ['BTC (SMS-Protected)', 'BTC (Multisig)', 'BTC (PIN-Protected)']

    optionsalCur.forEach((el) => {
      if (!hiddenCoinsList.includes(el)) {
        widgetCurrencies.push(el)
      }
    })

    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach((key) => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    let userCurrencies = allData.filter(({ currency, address, balance }) => {
      return (
        (!hiddenCoinsList.includes(currency) &&
          !hiddenCoinsList.includes(`${currency}:${address}`)) ||
        balance > 0
      )
    })

    if (isWidgetBuild) {
      userCurrencies = allData.filter(
        ({ currency, address }) =>
          !hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)
      )
      userCurrencies = userCurrencies.filter(({ currency }) => widgetCurrencies.includes(currency))
    }

    userCurrencies = userCurrencies.filter(({ currency }) =>
      //@ts-ignore: strictNullChecks
      getActivatedCurrencies().includes(currency)
    )

    switch (true) {
      case isWalletPage && !wasOnWalletLs:
        tourEvent = this.openWalletTour
        break
      case isPartialPage && !wasOnExchangeLs:
        tourEvent = this.openExchangeTour
        break
      case isWidgetBuild && !wasOnWidgetWalletLs:
        tourEvent = this.openWidgetWalletTour
        break
      case !userCurrencies.length && isWalletPage && !config.opts.plugins.backupPlugin:
        this.openCreateWallet({ onClose: tourEvent })
        break
      default:
        return
    }

    if (!didOpenWalletCreate && isWalletPage && !config.opts.plugins.backupPlugin) {
      this.openCreateWallet({ onClose: tourEvent })
      return
    }

    tourEvent()
  }

  closeTour = () => {
    this.setState(() => ({ isTourOpen: false }))
  }

  closeWidgetTour = () => {
    this.setState(() => ({ isWidgetTourOpen: false }))
  }

  closePartialTour = () => {
    this.setState(() => ({ isPartialTourOpen: false }))
  }

  openCreateWallet = (options) => {
    const {
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, links.createWallet))
  }

  openWalletTour = () => {
    const { wasOnWallet } = constants.localStorage

    setTimeout(() => {
      this.setState(() => ({ isTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnWallet, 'true')
  }

  openWidgetWalletTour = () => {
    const { wasOnWidgetWallet } = constants.localStorage

    setTimeout(() => {
      this.setState(() => ({ isWidgetTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnWidgetWallet, 'true')
  }

  openExchangeTour = () => {
    const { wasOnExchange } = constants.localStorage
    setTimeout(() => {
      this.setState(() => ({ isPartialTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnExchange, 'true')
  }

  handleSetDark = () => {
    this.setState(() => ({ themeSwapAnimation: true }))
    const wasDark = localStorage.getItem(constants.localStorage.isDark)

    feedback.theme.switched(wasDark ? 'bright' : 'dark')
    if (wasDark) {
      localStorage.removeItem(constants.localStorage.isDark)
    } else {
      localStorage.setItem(constants.localStorage.isDark, 'true')
    }
    window.location.reload()
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = async (orderId, participantPeer, link) => {
    const {
      toggle,
      history,
      intl: { locale },
      location: {
        pathname,
      },
    } = this.props

    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()

    if (typeof toggle === 'function') {
      toggle()
    }


    if ((pathname.substr(0, links.marketmaker.length) === links.marketmaker)
      || (pathname.substr(0, links.marketmaker_short) === links.marketmaker_short)
    ) {
      const swap = new Swap(orderId, SwapApp.shared())
      actions.core.rememberSwap(swap)
      window.active_swap = swap
    } else {
      await history.replace(localisedUrl(locale, link))
      await history.push(localisedUrl(locale, link))
    }
  }

  handleLogout = () => {
    const { intl } = this.props
    wpLogoutModal(this.handleLogout, intl)
  }

  render() {
    const {
      isTourOpen,
      isPartialTourOpen,
      menuItems,
      menuItemsMobile,
      createdWalletLoader,
      isWidgetTourOpen,
      themeSwapAnimation,
    } = this.state
    const {
      intl: { formatMessage },
      history: {
        location: { pathname },
      },
      feeds,
      peer,
      isInputActive,
    } = this.props

    const { exchange, wallet } = links

    const isWalletPage =
      pathname.includes(wallet) || pathname === `/ru${wallet}` || pathname === `/`

    const isExchange = pathname.includes(exchange)

    const isLogoutPossible = window.isUserRegisteredAndLoggedIn

    const logoRenderer = (
      <div styleName="flexebleHeader">
        <div>
          <Logo />
        </div>
        <div styleName="rightArea">
          <ThemeSwitcher themeSwapAnimation={themeSwapAnimation} onClick={this.handleSetDark} />

          {isLogoutPossible && ( // some wordpress plugin cases
            <div styleName={`logoutWrapper ${isDark ? 'dark' : ''}`} onClick={this.handleLogout}>
              <i className="fas fa-sign-out-alt" />
              <FormattedMessage id="ExitWidget" defaultMessage="Exit" />
            </div>
          )}
        </div>
      </div>
    )

    if (pathname.includes('/createWallet') && isMobile) {
      return <span />
    }

    const incomingSwapRequest = (
      <UserTooltip
        feeds={feeds}
        peer={peer}
        acceptRequest={this.acceptRequest}
        declineRequest={this.declineRequest}
      />
    )

    if (isMobile) {
      return (
        <header id="header-mobile" styleName="header-mobile">
          {logoRenderer}
          {createdWalletLoader && (
            <div styleName="loaderCreateWallet">
              <Loader
                showMyOwnTip={formatMessage({
                  id: 'createWalletLoaderTip',
                  defaultMessage: 'Creating wallet... Please wait.',
                })}
              />
            </div>
          )}
          {incomingSwapRequest}
          <NavMobile menu={menuItemsMobile} isHidden={isInputActive} />
          {isWidgetTourOpen && isWalletPage && (
            <div styleName="walletTour">
              <WidgetWalletTour isTourOpen={isWidgetTourOpen} closeTour={this.closeWidgetTour} />
            </div>
          )}
        </header>
      )
    }

    return (
      <header
        className={cx({
          [styles['header']]: true,
          [styles['widgetHeader']]: isWidgetBuild,
          [styles['header-promo']]: isWalletPage,
        })}
      >
        {createdWalletLoader && (
          <div styleName="loaderCreateWallet">
            <Loader
              showMyOwnTip={formatMessage({
                id: 'createWalletLoaderTip',
                defaultMessage: 'Creating wallet... Please wait.',
              })}
            />
          </div>
        )}
        {logoRenderer}
        <Nav menu={menuItems} />
        {isPartialTourOpen && isExchange && (
          <div styleName="walletTour">
            <TourPartial isTourOpen={isPartialTourOpen} closeTour={this.closePartialTour} />
          </div>
        )}
        {incomingSwapRequest}
        {isTourOpen && isWalletPage && (
          <div styleName="walletTour">
            <WalletTour isTourOpen={isTourOpen} closeTour={this.closeTour} />
          </div>
        )}
        {isWidgetTourOpen && isWalletPage && (
          <div styleName="walletTour">
            <WidgetWalletTour isTourOpen={isWidgetTourOpen} closeTour={this.closeWidgetTour} />
          </div>
        )}
      </header>
    )
  }
}

export default injectIntl(Header)
