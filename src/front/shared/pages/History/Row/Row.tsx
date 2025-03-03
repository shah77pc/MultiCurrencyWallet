import React, { Fragment } from 'react'
import cx from 'classnames'
import { connect } from 'redaction'
import cssModules from 'react-css-modules'
import styles from './Row.scss'
import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants, links } from 'helpers'
import { Link } from 'react-router-dom'
import ethToken from 'helpers/ethToken'
import { getFullOrigin } from 'helpers/links'

import CommentRow from 'components/Comment/Comment'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import getCurrencyKey from 'helpers/getCurrencyKey'
import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(({
  user: { tokensData },
}) => ({
  tokensData,
}))
@cssModules(styles, { allowMultiple: true })

export default class Row extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)

    const { hash, type, hiddenList, invoiceData, viewType } = props
    const dataInd = invoiceData && invoiceData.id
    const ind = `${dataInd || hash}-${type}`

    this.state = {
      viewType: (viewType || 'transaction'),
      exCurrencyRate: 0,
      comment: actions.comments.returnDefaultComment(hiddenList, ind),
      cancelled: false,
      payed: false,
      showFiat: true,
    }
  }

  componentDidMount() {
    const { type, tokensData } = this.props
    /*
    * request fiat balance if token have currency price
    */
    Object.keys(tokensData).forEach(key => {
      if (key.includes(type)) {
        if (tokensData[key].infoAboutCurrency) {
          this.getFiatBalance(type)
        } else {
          this.setState({
            showFiat: false
          })
        }
      }
    })
  }

  getFiatBalance = async (type) => {
    const { activeFiat } = this.props

    if (activeFiat) {
      actions.user.getExchangeRate(type, activeFiat.toLowerCase()).then((exCurrencyRate) => {
        this.setState(() => ({
          exCurrencyRate,
        }))
      })
    }
  }

  handlePayInvoice = async () => {
    const {
      invoiceData: {
        type,
        toAddress: address,
        amount,
        destAddress,
        fromAddress,
      },
      invoiceData: invoice,
    } = this.props

    const walletData = actions.core.getWallet({
      address,
      currency: type,
    })
    if (walletData) {
      const {
        currency,
        balance,
        unconfirmedBalance
      } = walletData
      //@ts-ignore: strictNullChecks
      actions.modals.open(constants.modals.Withdraw, {
        currency,
        address,
        balance,
        unconfirmedBalance,
        toAddress: destAddress || fromAddress,
        amount,
        invoice,
        hiddenCoinsList: [],
        onReady: () => {
          this.setState({
            payed: true,
          })
        },
      })
    }
  }

  handleCancelInvoice = async () => {
    const { invoiceData } = this.props

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        await actions.invoices.cancelInvoice(invoiceData.id)
        this.setState({
          cancelled: true,
        })
      },
    })
  }

  handleSendConfirmLink = () => {
    const {
      history,
      confirmTx: {
        uniqhash,
      },
    } = this.props

    const link = `${getFullOrigin()}${links.multisign}/btc/confirm/${uniqhash}`

    // history.push(shareLink)
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.Share, {
      link,
      title: `Confirm multisignature transaction`,
    })
  }

  handleConfirmTx = () => {
    const {
      history,
      confirmTx: {
        uniqhash,
      },
    } = this.props

    const shareLink = `${links.multisign}/btc/confirm/${uniqhash}`

    history.push(shareLink)
  }

  parseFloat = (direction, value, directionType, type) => {
    const { txType } = this.props
    switch (type) {
      case 'btc (sms-protected)': type = 'BTC'
        break
      case 'btc (pin-protected)': type = 'BTC'
        break
      case 'btc (multisig)': type = 'BTC'
        break
    }

    return (
      <Fragment>
        {direction === directionType ?
          <div styleName="amount">{`+ ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}
            {txType === 'INVOICE' ? <span styleName="smallTooltip"><Tooltip id='RowTooltipInvoice'>Invoice</Tooltip></span> : ''}
          </div> :
          <div styleName="amount">{`- ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div>
        }
      </Fragment>
    )
  }

  render() {
    const {
      activeFiat,
      address,
      type,
      direction,
      value,
      hash: propsHash,
      confirmations,
      txType,
      invoiceData,
      date,
      confirmTx,
    } = this.props

    const {
      showFiat,
    } = this.state

    const substrAddress = address ? `${address.slice(0, 2)}...${address.slice(-2)}` : ''
    const hash = (invoiceData && invoiceData.txInfo) ? invoiceData.txInfo : propsHash

    const { exCurrencyRate, cancelled, payed } = this.state
    const getFiat = value * exCurrencyRate
    
    const paymentAddress = invoiceData
      ? invoiceData.destAddress
        ? invoiceData.destAddress
        : invoiceData.fromAddress
      : ''

    const statusStyleName = cx('status', {
      'in': direction === 'in',
      'out': direction !== 'in',
      'self': direction === 'self',
    })
    let statusStyleAmount = statusStyleName

    if (invoiceData) {
      statusStyleAmount = cx('status', {
        'in': direction !== 'in',
        'out': direction === 'in',
        'self': direction === 'self',
      })
    }

    const hasInvoiceButtons = (invoiceData && !invoiceData.txid && direction === 'in' && invoiceData.status === 'new' && !cancelled && !payed)
    let invoiceStatusClass = 'confirm green'
    let invoiceStatusText = <FormattedMessage id="HistoryRowInvoiceStatusNew" defaultMessage="Пока не оплачен" />
    if (invoiceData && ((invoiceData.status === 'ready') || payed)) {
      invoiceStatusClass = 'confirm'
      invoiceStatusText = <FormattedMessage id="RowHistoryInvoicePayed" defaultMessage="Оплачен" />
    }
    if (invoiceData && ((invoiceData.status === 'cancelled') || cancelled)) {
      invoiceStatusClass = 'confirm red'
      invoiceStatusText = <FormattedMessage id="RowHistoryInvoiceCancelled" defaultMessage="Отклонен" />
    }
    /* eslint-disable */
    let txLink = `/${getCurrencyKey(type, false)}/tx/${hash}`
    if (ethToken.isEthToken({ name: type })) {
      txLink = `/token/${type}/tx/${hash}`
    }

    if (txType === 'INVOICE' && invoiceData.uniqhash) {
      txLink = `${links.invoice}/${invoiceData.uniqhash}`
    }

    if (txType === 'CONFIRM' && confirmTx.uniqhash) {
      txLink = `${links.multisign}/btc/confirm/${confirmTx.uniqhash}`
    }

    return (
      <>
        <tr styleName={`historyRow ${isDark ? 'dark' : ''}`}>
          <td>
            <div styleName={`${statusStyleAmount} circleIcon`}>
              <div styleName='arrowWrap'>
                <Link to={txLink}>
                  <svg width='12' height='15' viewBox='0 0 12 15' fill='none'>
                    <path d='M6 15V3' stroke='#8E9AA3' strokeWidth='2' />
                    <path d='M11 7L6 2L1 7' stroke='#8E9AA3' strokeWidth='2' />
                  </svg>
                </Link>
              </div>
            </div>
            <div styleName="historyInfo">
              <div>
                {txType === 'INVOICE' ?
                  <>
                    <Link to={txLink}>
                      <FormattedMessage
                        id="RowHistoryInvoce"
                        defaultMessage="Invoice #{number}"
                        values={{
                          number: `${invoiceData.id}-${invoiceData.invoiceNumber}`,
                        }}
                      />
                    </Link>
                    <div styleName={`${invoiceStatusClass} cell`}>
                      {invoiceStatusText}
                    </div>
                  </> :
                  <>
                    <Link to={txLink}>
                      {(txType === 'CONFIRM') ? (
                        <FormattedMessage id="RowHistory_Confirm_Sending" defaultMessage="Sent" />
                      ) : (
                          <>
                            {
                              direction === 'in'
                                ? <FormattedMessage id="RowHistory281" defaultMessage="Received {address}" values={{
                                  address: substrAddress ? <span><FormattedMessage id="fromRow" defaultMessage="from" /> {substrAddress}</span> : ""
                                }} />
                                : (
                                  direction !== 'self'
                                    ? <FormattedMessage id="RowHistory282" defaultMessage="Sent {address}" values={{
                                      address: substrAddress ? <span><FormattedMessage id="toRow" defaultMessage="to" /> {substrAddress}</span> : ""
                                    }} />
                                    : <FormattedMessage id="RowHistory283" defaultMessage="Self" />
                                )
                            }
                          </>
                        )}
                    </Link>

                    {/* Transaction status */}
                    {(txType === 'CONFIRM') ? (
                      <>
                        {confirmTx.status === 'pending' && (
                          <div styleName="unconfirmed cell">
                            <FormattedMessage id="RowHistory_Confirm_InProgress" defaultMessage="Pending" />
                          </div>
                        )}
                        {confirmTx.status === 'reject' && (
                          <div styleName="confirm red">
                            <FormattedMessage id="RowHistory_Confirm_Rejected" defaultMessage="Rejected" />
                          </div>
                        )}
                        {confirmTx.status === 'cancel' && (
                          <div styleName="confirm red">
                            <FormattedMessage id="RowHistory_Confirm_Cancelled" defaultMessage="Canceled" />
                          </div>
                        )}
                      </>
                    ) : (
                        <div styleName={confirmations > 0 ? 'confirm cell' : 'unconfirmed cell'}>
                          {confirmations > 0 ? confirmations > 6 ?
                            <FormattedMessage id="RowHistory34" defaultMessage="Received" /> :
                            <a href="#"><FormattedMessage id="RowHistory341" defaultMessage="Confirmed" /></a> :
                            <FormattedMessage id="RowHistory342" defaultMessage="Unconfirmed" />
                          }
                        </div>
                      )}
                  </>
                }
              </div>

              {/* Date */}
              <CommentRow
                label={invoiceData && invoiceData.label}
                date={date}
                showComment={true}
                commentKey={hash}
              />

              {/* Contacts */}
              {invoiceData && invoiceData.contact &&
                <div styleName='invoiceContactWrapper'>
                  <FormattedMessage
                    id="RowHistoryInvoiceContact"
                    defaultMessage='Contact:'
                  />{' '}
                  <span styleName='contact'>{invoiceData.contact}</span>
                </div>
              }

              {/* Payment address */}
              {txType === 'INVOICE' && direction === 'in' &&
                <div styleName='addressWrapper'>
                  <FormattedMessage
                    id="RowHistoryInvoiceAddress"
                    defaultMessage='Payment address:'
                  />{' '}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Address address={paymentAddress} format={AddressFormat.Short} />
                    <span styleName='requests'>({invoiceData.totalCount})</span>
                  </div>
                </div>
              }
            </div>

            {/* Invoice buttons */}
            {hasInvoiceButtons &&
              <div styleName="btnWrapper">
                <button onClick={this.handlePayInvoice}>
                  <FormattedMessage id='RowHistoryPayInvoice' defaultMessage='Pay' />
                </button>
                <button onClick={this.handleCancelInvoice}>
                  <FormattedMessage id='RowHistoryCancelInvoice' defaultMessage='Decline' />
                </button>
              </div>
            }

            {txType === 'CONFIRM' && confirmTx.status === 'pending' && (
              <div styleName="confirmWrapper">
                {(confirmTx.isHolder) ? (
                  <>
                    <span>
                      <FormattedMessage
                        id="RowHistory_ConfirmTX_NeedConfirm"
                        defaultMessage="Confirmation of another participant is required" />
                    </span>
                    <button onClick={this.handleSendConfirmLink}>
                      <FormattedMessage
                        id="RowHistory_ConfirmTX_SendLink"
                        defaultMessage="Send link"
                      />
                    </button>
                  </>
                ) : (
                    <>
                      <span>
                        <FormattedMessage
                          id="RowHistory_ConfirmTX_NeedYourSign"
                          defaultMessage="Your signature is required"
                        />
                      </span>
                      <button onClick={this.handleConfirmTx}>
                        <FormattedMessage
                          id="RowHistory_ConfirmTX_Sign"
                          defaultMessage="Confirm"
                        />
                      </button>
                    </>
                  )}
              </div>
            )}

            {/* Currency amount */}
            <div styleName={statusStyleAmount}>
              {invoiceData ? this.parseFloat(direction, value, 'out', type) : this.parseFloat(direction, value, 'in', type)}
              {
                showFiat
                  ? <span styleName='amountUsd'>{`~${getFiat.toFixed(2)}`}{` `}{activeFiat}</span>
                  : null
              }
            </div>
          </td>
        </tr>
      </>
    )
  }
}
