import { setup, importWallet, addAssetToWallet, turnOnMM, takeScreenshot, timeOut } from './utils'

const MAKER_SEED = ['neither', 'already', 'situate', 'silent', 'ripple', 'milk', 'paddle', 'glass', 'leopard', 'track', 'mansion', 'junk']
const makerBtcAddress = 'n2Y2rbg6wVEQnnpNxisiHK4wCDUAq59iv6'

const TAKER_SEED = ['honey', 'stereo', 'harsh', 'diary', 'select', 'episode', 'ready', 'ritual', 'best', 'target', 'paper', 'auto']
const takerBtcAddress = 'n4JjB9D9axszdsFxyxDmF43z4WwttN6oPb'

jest.setTimeout(100 * 1000)

describe('Try swap', () => {
  it('turn on MM', async () => {
    // const { browser: MakerBrowser, page: MakerPage } = await setup()
    // const { browser: TakerBrowser, page: TakerPage } = await setup()

    // await importWallet(MakerPage, MAKER_SEED)
    // await importWallet(TakerPage, TAKER_SEED)

    // await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
    // await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

    // await addAssetToWallet(MakerPage, 'wbtc')
    // await addAssetToWallet(TakerPage, 'wbtc')

    // await turnOnMM(MakerPage)

    // await timeOut(2 * 1000)

    // // move to exchange page
    // const takerExchangePageLink = await TakerPage.$('a[href="#/exchange"]')
    // await takerExchangePageLink.click()

    // await timeOut(2 * 1000)

    // try {
    //   const [sellCurrencySelectorList, fromWalletSelectorList, buyCurrencySelectorList, toWalletSelectorList] = await TakerPage.$$('.itemsSelector')

    //   await buyCurrencySelectorList.click();
    //   await TakerPage.click(`#wbtc`)

    //   await fromWalletSelectorList.click()
    //   await takeScreenshot(TakerPage, 'Taker_Page_fromWalletSelectorList')
    //   await TakerPage.click('#Internal')

    //   await timeOut(2 * 1000)

    //   await toWalletSelectorList.click({clickCount: 2})
    //   await takeScreenshot(TakerPage, 'Taker_Page_toWalletSelectorList')
    //   await TakerPage.click('#Internal')

    //   await timeOut(10 * 1000)

    //   await takeScreenshot(MakerPage, 'Maker_Page_Wallet')
    //   await takeScreenshot(TakerPage, 'Taker_Page_Wallet')
    // } catch (error) {
    //   console.log('Error: ', error)
    //   await MakerBrowser.close()
    //   await TakerBrowser.close()
    // }


    // await MakerBrowser.close()
    // await TakerBrowser.close()

  })

})