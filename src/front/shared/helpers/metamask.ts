import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet, constants } from 'helpers'
import config from 'app-config'
import { setMetamask, setProvider, setDefaultProvider, getWeb3 as getDefaultWeb3 } from 'helpers/web3'
import SwapApp from 'swap.app'
import Web3Connect from '../../../common/web3connect'


const mmLabel = (config.binance) ? `BSC` : `Ethereum`
const mmLabelShort = (config.binance) ? `BNB` : `ETH`



const web3connect = new Web3Connect({
  web3ChainId: (config.binance)
    ? (process.env.MAINNET) ? 56 : 97  // 56 = Mainnet, 97 = Testnet
    : (process.env.MAINNET) ? 1 : 3, // 1 = Mainnet, 3 = Ropsten
  web3RPC: (config.binance)
    ? config.binance_provider
    : config.web3.provider,
})

const _onWeb3Changed = (newWeb3) => {
  setProvider(newWeb3)
  //@ts-ignore: strictNullChecks
  SwapApp.shared().setWeb3Provider(newWeb3)
  _initReduxState()
  actions.user.sign_to_tokens()
  actions.user.getBalances()
}

web3connect.on('connected', async () => {
  localStorage.setItem(constants.localStorage.isWalletCreate, 'true')
  actions.core.markCoinAsVisible(`ETH`)
  _onWeb3Changed(web3connect.getWeb3())
})

web3connect.on('disconnect', async () => {
  setDefaultProvider()
  _onWeb3Changed(getDefaultWeb3())
})

web3connect.on('accountChange', async () => {
  _onWeb3Changed(web3connect.getWeb3())
})

web3connect.on('chainChanged', async () => {
  _onWeb3Changed(web3connect.getWeb3())
})

const isEnabled = () => true

const isConnected = () => web3connect.isConnected()

const getAddress = () => (isConnected()) ? web3connect.getAddress() : ``

const getWeb3 = () => (isConnected()) ? web3connect.getWeb3() : false

const _init = async () => {
  web3connect.onInit(() => {
    if (web3connect.hasCachedProvider()) {
      let _web3 = false
      try {
        //@ts-ignore: strictNullChecks
        _web3 = web3connect.getWeb3()
      } catch (err) {
        web3connect.clearCache()
        _initReduxState()
        return
      }
      setMetamask(_web3)
      _initReduxState()
    } else {
      _initReduxState()
    }
  })
}

const addWallet = () => {
  _initReduxState()
  if (isConnected()) {
    getBalance()
  }
}

const getBalance = () => {
  console.log('metamask getBalance')
  const { user: { metamaskData } } = getState()
  if (metamaskData) {
    const { address } = metamaskData

    const balanceInCache = cacheStorageGet('currencyBalances', `eth_${address}`)
    if (balanceInCache !== false) {
      reducers.user.setBalance({
        name: 'metamaskData',
        amount: balanceInCache,
      })
      return balanceInCache
    }

    //@ts-ignore: strictNullChecks
    return web3connect.getWeb3().eth.getBalance(address)
      .then(result => {
        //@ts-ignore: strictNullChecks
        const amount = web3connect.getWeb3().utils.fromWei(result)

        cacheStorageSet('currencyBalances', `eth_${address}`, amount, 30)
        reducers.user.setBalance({ name: 'metamaskData', amount })
        return amount
      })
      .catch((e) => {
        console.log('fail get balance')
        console.log('error', e)
        reducers.user.setBalanceError({ name: 'metamaskData' })
      })
  }
}

const disconnect = () => new Promise(async (resolved, reject) => {
  if (isConnected()) {
    await web3connect.Disconnect()
    resolved(true)
    // window.location.reload()
  } else {
    resolved(true)
  }
})

const connect = (options) => new Promise(async (resolved, reject) => {
  actions.modals.open(constants.modals.ConnectWalletModal, {
    ...options,
    onResolve: resolved,
    onReject: reject,
  })
})

/* metamask wallet layer */
const isCorrectNetwork = () => web3connect.isCorrectNetwork()


const _initReduxState = () => {
  const {
    user: {
      ethData,
    },
  } = getState()

  if (isConnected()) {
    reducers.user.addWallet({
      name: 'metamaskData',
      data: {
        address: getAddress(),
        balance: 0,
        balanceError: false,
        isConnected: true,
        isMetamask: true,
        currency: mmLabelShort,
        fullName: `${mmLabel} (${web3connect.getProviderTitle()})`,
        infoAboutCurrency: ethData.infoAboutCurrency,
        isBalanceFetched: true,
        isMnemonic: true,
        unconfirmedBalance: 0,
      },
    })
  } else {
    reducers.user.addWallet({
      name: 'metamaskData',
      data: {
        address: 'Not connected',
        balance: 0,
        balanceError: false,
        isConnected: false,
        isMetamask: true,
        currency: mmLabelShort,
        fullName: `${mmLabel} (external wallet)`,
        infoAboutCurrency: ethData.infoAboutCurrency,
        isBalanceFetched: true,
        isMnemonic: true,
        unconfirmedBalance: 0,
      }
    })
  }
}

if (web3connect.hasCachedProvider()) {
  _init()
} else {
  _initReduxState()
}


const handleDisconnectWallet = (cbDisconnected?) => {
  if (isEnabled()) {
    disconnect().then(async () => {
      await actions.user.sign()
      await actions.user.getBalances()
      if (cbDisconnected) cbDisconnected()
    })
  }
}

const handleConnectMetamask = (options?: {
  dontRedirect?: boolean
  cbFunction?: Function
}) => {
  const {
    //@ts-ignore: strictNullChecks
    dontRedirect,
    //@ts-ignore: strictNullChecks
    cbFunction,
  } = options

  connect({ dontRedirect }).then(async (connected) => {
    if (connected) {
      await actions.user.sign()
      await actions.user.getBalances()
      if (cbFunction) cbFunction(true)
    } else {
      if (cbFunction) cbFunction(false)
    }
  })
}

const metamaskApi = {
  connect,
  isEnabled,
  isConnected,
  getAddress,
  web3connect,
  addWallet,
  getBalance,
  getWeb3,
  disconnect,
  isCorrectNetwork,
  handleDisconnectWallet,
  handleConnectMetamask,
}

window.metamaskApi = metamaskApi

export default metamaskApi
