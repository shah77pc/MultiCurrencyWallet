import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'
import { localisedUrl } from 'helpers/locale'
import actions from 'redux/actions'
import constants from 'helpers/constants'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type NavProps = {
  menu: IUniversalObj[]
  isHidden?: boolean
  intl: any
}
//@ts-ignore: strictNullChecks
@withRouter
@CSSModules(styles, { allowMultiple: true })
class NavMobile extends Component<NavProps, null> {
  render() {
    const {
      menu,
      intl: { locale },
      isHidden,
    } = this.props

    return (
      <nav styleName={`navbar ${isDark ? 'dark' : ''} ${isHidden ? 'navbar-hidden' : ''}`}>
        {menu
          .filter(i => i.isMobile !== false)
          .map((item, index) => {
            const {
              title,
              link,
              exact,
              icon,
              isBold,
              isExternal,
              currentPageFlag,
              displayNone,
            } = item

            if (isExternal) {
              return (
                <a href={link} target="_blank" key={index}>
                  {icon}
                  <span className={isBold && styles.bold}>{title}</span>
                </a>
              )
            }

            return !displayNone && currentPageFlag ? (
                <a
                  key={index}
                  href={link}
                  tabIndex={-1}
                >
                  {icon}
                  <span className={isBold && styles.bold}>{title}</span>
                </a>
              ) : (
                <NavLink
                  key={index}
                  exact={exact}
                  to={localisedUrl(locale, link)}
                  activeClassName={styles.active}
                >
                  {icon}
                  <span className={isBold && styles.bold}>{title}</span>
                </NavLink>
              )
          })
        }
      </nav>
    )
  }
}

//@ts-ignore: strictNullChecks
export default injectIntl(NavMobile)
