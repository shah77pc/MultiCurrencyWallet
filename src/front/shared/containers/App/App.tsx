import React from "react";

import { RouteComponentProps, withRouter, HashRouter } from "react-router-dom";
import actions from "redux/actions";
import { connect } from "redaction";
import moment from "moment-with-locales-es6";
import {
  constants,
  localStorage,
} from "helpers";

import CSSModules from "react-css-modules";
import styles from "./App.scss";
import "scss/app.scss";

import { createSwapApp } from "instances/newSwap";
import Core from "containers/Core/Core";

import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";
import Loader from "components/loaders/Loader/Loader";
import PreventMultiTabs from "components/PreventMultiTabs/PreventMultiTabs";
import RequestLoader from "components/loaders/RequestLoader/RequestLoader";
import ModalConductor from "components/modal/ModalConductor/ModalConductor";
import WidthContainer from "components/layout/WidthContainer/WidthContainer";
import NotificationConductor from "components/notification/NotificationConductor/NotificationConductor";
import Seo from "components/Seo/Seo";

import config from "helpers/externalConfig"
import { redirectTo, links, utils } from 'helpers'
import backupUserData from 'plugins/backupUserData'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import metamask from 'helpers/metamask'


const userLanguage = (navigator.userLanguage || navigator.language || "en-gb").split("-")[0];
moment.locale(userLanguage)


const metamaskNetworks = defineMessages({
  mainnet: {
    id: `MetamaskNetworkAlert_NetworkMainnet`,
    defaultMessage: `Основная сеть (Mainnet)`,
  },
  testnet: {
    id: `MetamaskNetworkAlert_NetworkTestnet`,
    defaultMessage: `Тестовая сеть (Ropsten)`,
  },
  bnb_mainnet: {
    id: `MetamaskNetworkAlert_BnBNetworkMainnet`,
    defaultMessage: `Mainnet Binance Smart Chain`,
  },
  bnb_testnet: {
    id: `MetamaskNetworkAlert_BnBNetworkTestnet`,
    defaultMessage: `Testnet Binance Smart Chain`,
  },
})



@withRouter
@connect(({ currencies: { items: currencies }, modals, ui: { dashboardModalsAllowed } }) => ({
  currencies,
  isVisible: "loader.isVisible",
  ethAddress: "user.ethData.address",
  btcAddress: "user.btcData.address",
  ghostAddress: "user.ghostData.address",
  nextAddress: "user.nextData.address",
  tokenAddress: "user.tokensData.swap.address",
  modals,
  dashboardModalsAllowed,
}))
@CSSModules(styles, { allowMultiple: true })
class App extends React.Component<RouteComponentProps<any>, any> {

  prvMultiTab: any
  localStorageListener: any

  constructor(props) {
    super(props);

    this.localStorageListener = null;

    this.prvMultiTab = {
      reject: null,
      enter: null,
      switch: null
    };

    this.state = {
      initialFetching: true,
      completeCreation: false,
      multiTabs: false,
      error: "",
    }
  }


  generadeId(callback) {
    const newId = Date.now().toString();

    this.setState(
      {
        appID: newId
      },
      () => {
        callback(newId);
      }
    );
  }

  preventMultiTabs(isSwitch) {
    this.generadeId(newId => {
      if (isSwitch) {
        localStorage.setItem(constants.localStorage.switch, newId);
      }

      const onRejectHandle = () => {
        const { appID } = this.state;
        const id = localStorage.getItem(constants.localStorage.reject);

        if (id && id !== appID) {
          this.setState({ multiTabs: true });

          localStorage.unsubscribe(this.prvMultiTab.reject);
          localStorage.unsubscribe(this.prvMultiTab.enter);
          localStorage.unsubscribe(this.prvMultiTab.switch);
          localStorage.removeItem(constants.localStorage.reject);
        }
      };

      const onEnterHandle = () => {
        const { appID } = this.state;
        const id = localStorage.getItem(constants.localStorage.enter);
        const switchId = localStorage.getItem(constants.localStorage.switch);

        if (switchId && switchId === id) return;

        localStorage.setItem(constants.localStorage.reject, appID);
      };

      const onSwitchHangle = () => {
        const switchId = localStorage.getItem(constants.localStorage.switch);
        const { appID } = this.state;

        if (appID !== switchId) {
          //@ts-ignore
          if (chrome && chrome.extension) {
            //@ts-ignore
            const extViews = chrome.extension.getViews()
            //@ts-ignore
            const extBgWindow = chrome.extension.getBackgroundPage()
            if (extBgWindow !== window && extViews.length > 2) {
              window.close()
              return
            }
          }
          this.setState({
            multiTabs: true
          });

          localStorage.unsubscribe(this.prvMultiTab.reject);
          localStorage.unsubscribe(this.prvMultiTab.enter);
          localStorage.unsubscribe(this.prvMultiTab.switch);
        }
      };

      this.prvMultiTab.reject = localStorage.subscribe(constants.localStorage.reject, onRejectHandle);
      this.prvMultiTab.enter = localStorage.subscribe(constants.localStorage.enter, onEnterHandle);
      this.prvMultiTab.switch = localStorage.subscribe(constants.localStorage.switch, onSwitchHangle);

      localStorage.setItem(constants.localStorage.enter, newId);
    });
  }

  popupIncorrectNetwork() {
    //@ts-ignore
    const { intl } = this.props

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.AlertModal, {
      title: (
        <FormattedMessage 
          id="MetamaskNetworkAlert_Title"
          defaultMessage="Внимание"
        />
      ),
      message: (
        <FormattedMessage
          id="MetamaskNetworkAlert_Message"
          defaultMessage="Для продолжения выберите в кошельке {walletTitle} &quot;{network}&quot; или отключите кошелек"
          values={{
            network: intl.formatMessage(metamaskNetworks[(config.binance) ? `bnb_${config.entry}` : config.entry]),
            walletTitle: metamask.web3connect.getProviderTitle(),
          }}
        />
      ),
      labelOk: (
        <FormattedMessage
          id="MetamaskNetworkAlert_OkDisconnectWallet"
          defaultMessage="Отключить внешний кошелек"
        />
      ),
      dontClose: true,
      okButtonAutoWidth: true,
      callbackOk: () => {
        metamask.disconnect()
        actions.modals.close(constants.modals.AlertModal)
      },
    })
  }

  processMetamask () {
    metamask.web3connect.onInit(() => {
      const _checkChain = () => {
        if (metamask.isCorrectNetwork()) {
          actions.modals.close(constants.modals.AlertModal)
        } else {
          this.popupIncorrectNetwork()
        }
      }

      metamask.web3connect.on('chainChanged', _checkChain)
      metamask.web3connect.on('connected', _checkChain)

      if (metamask.isConnected()
        && !metamask.isCorrectNetwork()
      ) {
        this.popupIncorrectNetwork()
      }
    })
  }

  processUserBackup () {
    new Promise(async (resolve) => {
      const wpLoader = document.getElementById('wrapper_element')

      const hasServerBackup = await backupUserData.hasServerBackup()
      console.log('has server backup', hasServerBackup)
      if (backupUserData.isUserLoggedIn()
        && backupUserData.isUserChanged()
        && hasServerBackup
      ) {
        console.log('do restore user')
        backupUserData.restoreUser().then((isRestored) => {
          console.log('is restored', isRestored, constants.localStorage.isWalletCreate)
          if (isRestored) {
            if (localStorage.getItem(constants.localStorage.isWalletCreate)) {
              redirectTo(links.home)
              window.location.reload()
            } else {
              redirectTo(config.binance ? links.exchange : links.createWallet)
              if (wpLoader) wpLoader.style.display = 'none'
            }
          }
        })
      } else {
        if (backupUserData.isUserLoggedIn()
          && backupUserData.isFirstBackup()
          || !hasServerBackup
        ) {
          console.log('Do backup user')
          backupUserData.backupUser().then(() => {
            if (wpLoader) wpLoader.style.display = 'none'
          })
        } else {
          if (wpLoader) wpLoader.style.display = 'none'
        }
      }
      resolve(`ready`)
    })
  }

  async componentDidMount() {
    //@ts-ignore
    const { currencies } = this.props

    this.preventMultiTabs(false)

    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

    if (!isWalletCreate) {
      currencies.forEach(({ name }) => {
        if (name !== "BTC") {
          actions.core.markCoinAsHidden(name)
        }
      })
    }

    this.processUserBackup()
    this.processMetamask()

    this.checkIfDashboardModalsAllowed()
    window.actions = actions;

    window.onerror = (error) => {
      console.error('App error: ', error)
    };

    try {
      const db = indexedDB.open("test");
      db.onerror = (e) => {
        console.error('db error', e)
      };
    } catch (e) {
      console.error('db error', e)
    }

    window.prerenderReady = true;

    const appInstalled = (e) => {
      alert(
        userLanguage === 'ru'
          ? 'Подождите пока приложение устанавливается'
          : 'Wait while application is installing'
      )
      window.removeEventListener('appinstalled', appInstalled)
    }
    window.addEventListener('appinstalled', appInstalled)

    this.checkCompletionOfAppCreation()
  }

  componentDidUpdate() {
    const { initialFetching, completeCreation } = this.state

    this.checkIfDashboardModalsAllowed()

    if (initialFetching && completeCreation) {
      // without setTimeout splash screen freezes when creating wallets
      setTimeout(() => {
        this.completeAppCreation().then(() => {
          this.setState(() => ({
            initialFetching: false,
          }))
        })
      })
    }
  }

  completeAppCreation = async () => {
    console.group('App >%c loading...', 'color: green;')

    actions.user.sign()
    await createSwapApp()

    this.setState(() => ({
      initialFetching: false,
      completeCreation: false,
    }))

    console.groupEnd()
  }

  checkCompletionOfAppCreation = () => {
    const startPage = document.getElementById('starter-modal')
    const isWalletCreated = localStorage.getItem('isWalletCreate')

    if (
      !startPage ||
      utils.getCookie('startedSplashScreenIsDisabled') ||
      isWalletCreated ||
      config.binance ||
      window.location.hash !== '#/'
    ) {
      this.setState(() => ({
        initialFetching: true,
        completeCreation: true,
      }))
    } else {
      this.addStartPageListeners()
    }
  }

  setCompleteCreation = () => {
    this.removeStartPageListeners()
    this.setState(() => ({
      completeCreation: true,
    }))
  }

  addStartPageListeners = () => {
    // id from index.html start page
    const createBtn = document.getElementById('preloaderCreateBtn')
    const connectBtn = document.getElementById('preloaderConnectBtn')
    const restoreBtn = document.getElementById('preloaderRestoreBtn')
    const skipBtn = document.getElementById('preloaderSkipBtn')
  
    if (createBtn) createBtn.addEventListener('click', this.setCompleteCreation)
    if (connectBtn) connectBtn.addEventListener('click', this.setCompleteCreation)
    if (restoreBtn) restoreBtn.addEventListener('click', this.setCompleteCreation)
    if (skipBtn) skipBtn.addEventListener('click', this.setCompleteCreation)
  }

  removeStartPageListeners = () => {
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderCreateBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderConnectBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderRestoreBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderSkipBtn').removeEventListener('click', this.setCompleteCreation)
  }

  checkIfDashboardModalsAllowed = () => {
    const dashboardModalProvider = document.querySelector('.__modalConductorProvided__')
    //@ts-ignore
    if (dashboardModalProvider && !this.props.dashboardModalsAllowed) {
      return actions.ui.allowDashboardModals()
    //@ts-ignore
    } else if (dashboardModalProvider && this.props.dashboardModalsAllowed) {
      return null
    }
    return actions.ui.disallowDashboardModals()
  }

  handleSwitchTab = () => {
    this.setState({
      multiTabs: false
    });
    this.preventMultiTabs(true);
  };

  overflowHandler = () => {
    //@ts-ignore
    const { modals, dashboardModalsAllowed } = this.props;
    const isAnyModalCalled = Object.keys(modals).length > 0

    const isDark = localStorage.getItem(constants.localStorage.isDark)

    if (typeof document !== 'undefined' && isAnyModalCalled && !dashboardModalsAllowed) {
      document.body.classList.remove('overflowY-default')
      document.body.classList.add('overflowY-hidden')
    } else {
      document.body.classList.remove('overflowY-hidden')
      document.body.classList.add('overflowY-default')
    }
    if (typeof document !== 'undefined' && isAnyModalCalled && dashboardModalsAllowed) {
      document.body.classList.remove('overflowY-dashboardView-default')
      document.body.classList.add('overflowY-dashboardView-hidden')
    } else {
      document.body.classList.remove('overflowY-dashboardView-hidden')
      document.body.classList.add('overflowY-dashboardView-default')
    }

    if (isDark) {
      document.body.classList.add('darkTheme')
    }
  }

  render() {
    const { initialFetching, multiTabs } = this.state;
    //@ts-ignore
    const { children, ethAddress, btcAddress, ghostAddress, nextAddress, tokenAddress, history, dashboardModalsAllowed } = this.props;

    this.overflowHandler()

    const isFetching = !ethAddress || !btcAddress || !ghostAddress || !nextAddress || (!tokenAddress && config && !config.isWidget) || initialFetching;

    const isWidget = history.location.pathname.includes("/exchange") && history.location.hash === "#widget";
    const isCalledFromIframe = window.location !== window.parent.location;
    const isWidgetBuild = config && config.isWidget;

    if (isWidgetBuild && localStorage.getItem(constants.localStorage.didWidgetsDataSend) !== "true") {
      localStorage.setItem(constants.localStorage.didWidgetsDataSend, true);
    }

    if (multiTabs) {
      return <PreventMultiTabs onSwitchTab={this.handleSwitchTab} />
    }

    if (isFetching && localStorage.getItem('isWalletCreate') === null) {
      return (
        <Loader 
          showMyOwnTip={
            <FormattedMessage id="Table96" defaultMessage="Loading..." />
          }
        />
      )
    }

    const isSeoDisabled = isWidget || isWidgetBuild || isCalledFromIframe

    return <HashRouter>
      <div styleName="compressor">
        {!isSeoDisabled &&
          <Seo location={history.location} />
        }
        {/*
        //@ts-ignore */}
        <WidthContainer id="swapComponentWrapper" styleName="headerAndMain">
          <Header />
          <main>{children}</main>
        </WidthContainer>
        <Core />
        <Footer />
        <RequestLoader />
        {!dashboardModalsAllowed &&
          <ModalConductor history={history}
        />}
        <NotificationConductor history={history} />
      </div>
    </HashRouter>;
  }
}

export default withRouter(injectIntl(App))
