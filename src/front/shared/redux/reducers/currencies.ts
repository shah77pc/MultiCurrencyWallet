import config from 'app-config'


const GetCustromERC20 = () => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'
  //@ts-ignore: strictNullChecks
  let tokensInfo = JSON.parse(localStorage.getItem('customERC'))
  if (!tokensInfo || !tokensInfo[configStorage]) return {}
  return tokensInfo[configStorage]
}

let buildOpts = {
  curEnabled: false,
  blockchainSwapEnabled: false,
  ownTokens: false,
  addCustomERC20: true,
  invoiceEnabled: true,
}

if (window
  && window.buildOptions
  && Object.keys(window.buildOptions)
  && Object.keys(window.buildOptions).length
) {
  buildOpts = { ...buildOpts, ...window.buildOptions }
}

if (window
  && window.widgetERC20Tokens
  && Object.keys(window.widgetERC20Tokens)
  && Object.keys(window.widgetERC20Tokens).length
) {
  buildOpts.ownTokens = window.widgetERC20Tokens
}
if (buildOpts.ownTokens && Object.keys(buildOpts.ownTokens).length) {
  // Multi token mode
  const cleanERC20 = {}
  // Обходим оптимизацию, нам нельзя, чтобы в этом месте было соптимизированно в целую строку {#WIDGETTOKENCODE#}
  const wcPb = `{#`
  const wcP = (`WIDGETTOKENCODE`).toUpperCase()
  const wcPe = `#}`
  Object.keys(buildOpts.ownTokens).forEach((key) => {
    if (key !== (`${wcPb}${wcP}${wcPe}`)) {
      const tokenData = buildOpts.ownTokens[key]
      cleanERC20[key] = tokenData
    }
  })
  config.erc20 = cleanERC20
}


const initialState = {
  items: [
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ghost) ? [{
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.next) ? [{
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [{
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
      addAssets: true,
    },
    {
      name: 'BTC (SMS-Protected)',
      title: 'BTC (SMS-Protected)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
      dontCreateOrder: true,
    },
    {
      name: 'BTC (PIN-Protected)',
      title: 'BTC (PIN-Protected)',
      icon: 'btc',
      value: 'btcMultisigPin',
      fullTitle: 'bitcoinMultisigPin',
      addAssets: false,
      dontCreateOrder: true,
    },
    {
      name: 'BTC (Multisig)',
      title: 'BTC (Multisig)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
      dontCreateOrder: true,
    }] : [],
    ...(Object.keys(config.erc20)
      .map(key => ({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: key,
        addAssets: true,
      }))),
  ],
  partialItems: [
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.ghost) ? [{
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.next) ? [{
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.btc) ? [{
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    }] : [],
    ...(Object.keys(config.erc20)
      .filter(key => config.erc20[key].canSwap)
      .map(key => ({
            name: key.toUpperCase(),
            title: key.toUpperCase(),
            icon: key,
            value: key,
            fullTitle: config.erc20[key].fullName || key,
          }
      ))),
  ],
  addSelectedItems: [],
  addPartialItems: [],
}


if (config.isWidget) {
  //@ts-ignore
  initialState.items = [
    //@ts-ignore
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    //@ts-ignore
    {
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    },
    //@ts-ignore
    {
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
    },
  ]

  initialState.partialItems = [
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    {
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    },
    {
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
    },
  ]

  // Мульти валюта с обратной совместимостью одиночного билда
  const multiTokenNames = (window.widgetERC20Tokens) ? Object.keys(window.widgetERC20Tokens) : []

  if (multiTokenNames.length > 0) {
    // First token in list - is main - fill single-token erc20 config
    config.erc20token = multiTokenNames[0]
    config.erc20[config.erc20token] = window.widgetERC20Tokens[config.erc20token]
    multiTokenNames.forEach((key) => {
      //@ts-ignore
      initialState.items.push({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: window.widgetERC20Tokens[key].fullName,
      })
      initialState.partialItems.push({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: window.widgetERC20Tokens[key].fullName,
      })
    })

  } else {
    //@ts-ignore
    initialState.items.push({
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    })
    initialState.partialItems.push({
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    })
  }
  //@ts-ignore
  initialState.items.push({
    name: 'ETH',
    title: 'ETH',
    icon: 'eth',
    value: 'eth',
    fullTitle: 'ethereum',
  })
  //@ts-ignore
  initialState.items.push({
    name: 'GHOST',
    title: 'GHOST',
    icon: 'ghost',
    value: 'ghost',
    fullTitle: 'ghost',
  })
  //@ts-ignore
  initialState.items.push({
    name: 'NEXT',
    title: 'NEXT',
    icon: 'next',
    value: 'next',
    fullTitle: 'next',
  })

  initialState.addSelectedItems = [
    {
      //@ts-ignore: strictNullChecks
      name: config.erc20token.toUpperCase(),
      //@ts-ignore: strictNullChecks
      title: config.erc20token.toUpperCase(),
      //@ts-ignore: strictNullChecks
      icon: config.erc20token,
      //@ts-ignore: strictNullChecks
      value: config.erc20token,
      //@ts-ignore: strictNullChecks
      fullTitle: config.erc20[config.erc20token].fullName,
    },
  ]
} else {
  if (!config.isWidget && buildOpts.addCustomERC20) {
    const customERC = GetCustromERC20()
    Object.keys(customERC).forEach((tokenContract) => {
      const symbol = customERC[tokenContract].symbol
      //@ts-ignore
      initialState.items.push({
        name: symbol.toUpperCase(),
        title: symbol.toUpperCase(),
        icon: symbol.toLowerCase(),
        value: symbol.toLowerCase(),
        fullTitle: symbol,
      })
      initialState.partialItems.push({
        name: symbol.toUpperCase(),
        title: symbol.toUpperCase(),
        icon: symbol.toLowerCase(),
        value: symbol.toLowerCase(),
        fullTitle: symbol,
      })
    })
  }
}
// eslint-disable-next-line
// process.env.MAINNET && initialState.items.unshift({
//   name: 'USDT',
//   title: 'USDT',
//   icon: 'usdt',
//   value: 'usdt',
//   fullTitle: 'USD Tether',
// })
// eslint-disable-next-line


const addSelectedItems = (state, payload) => ({
  ...state,
  addSelectedItems: payload,
})

const addPartialItems = (state, payload) => ({
  ...state,
  addPartialItems: payload,
})

const updatePartialItems = (state, payload) => ({
  ...state,
  partialItems: payload,
})

const deletedPartialCurrency = (state, payload) => ({
  ...state,
  partialItems: state.partialItems.filter(item => item.name !== payload),
})


export {
  initialState,
  addSelectedItems,
  addPartialItems,
  updatePartialItems,
  deletedPartialCurrency,
}
