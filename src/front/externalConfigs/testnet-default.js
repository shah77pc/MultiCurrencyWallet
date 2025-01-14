// mainnet-localhost

window.widgetERC20Comisions = {
  btc: {
    fee: '5',
    address: '2MuXz9BErMbWmoTshGgkjd7aMHeaxV8Bdkk',
    min: '0.00001',
  },
  ghost: {
    fee: '5',
    address: 'XUmEvrKkTEGPr8WaktQVVE49ZBxcaPUmwv',
    min: '0.00001',
  },
  next: {
    fee: '5',
    address: 'XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4', // random address
    min: '0.00001',
  },
  eth: {
    fee: '7',
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
    min: '0,01',
  },
  erc20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
}

/*
window.widgetERC20Tokens = {
  usdt: {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    fullName: 'Usdt',
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  },
  // Symbol of ERC20 token in lowerCase
  proxima: {
    // Address of ERC20 contract
    address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
    // Count of decimals after dot
    decimals: 18,
    // Display name in wallet (By default - its symbol of ERC20, but can be other userfriendy text)
    fullName: 'Proxima',
    // Icon of currency (image)
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
    // Background color of icon
    iconBgColor: '#ccc',
  },
}

window.buildOptions = {
  ownTokens: true, // Will be inited from window.widgetERC20Tokens
  addCustomERC20: true, // Allow user add custom erc20 tokens
  curEnabled: false,
  showWalletBanners: true, // Allow to see banners
  invoiceEnabled: true, // Allow create invoices
  hideShowPrivateKey: true, // Hide 'Copy Private Key' Menu item, default false, inited also from window.SWAP_HIDE_EXPORT_PRIVATEKEY
//  fee: { btc .... }, // Can be inited from window.widgetERC20Comisions
  // inited from window.EXCHANGE_DISABLED
  exchangeDisabled: true,
  curEnabled: { // Or 'false' if enabled all
    // inited from window.CUR_BTC_DISABLED
    btc: false,
    // inited from window.CUR_ETH_DISABLED
    eth: false,
  },
}
*/

window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
  showHowItsWork: true, // Can be inited from window.showHowItWorksOnExchangePage
  // inited from window.EXCHANGE_DISABLED
  exchangeDisabled: false,
  curEnabled: { // Or 'false' if enabled all
    // inited from window.CUR_BTC_DISABLED
    btc: true,
    // inited from window.CUR_ETH_DISABLED
    eth: true,
    ghost: true,
    next: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: true,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: 'usdt',
    sell: 'btc',
  }
}
