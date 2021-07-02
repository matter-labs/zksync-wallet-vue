describe("Deposit", () => {
  const puppeteer = require('puppeteer');
  const dappeteer = require('@warsmit/dappeteer');
  var browser;
  var metamask;
  var walletPage;
  var metamaskPage;

  const clickInnerText = text => {
    return walletPage.evaluate(text => [...document.querySelectorAll('*')].find(e => e.innerText === text).click(), text)
  }
  const waitInnerText = text => {
    return walletPage.waitForFunction(text => [...document.querySelectorAll('*')].find(e => e.innerText === text), {}, text)
  }

  test('Account connect to MetaMask extention', async () => {
    browser = await dappeteer.launch(puppeteer, {
      headless: false,
      slowMo: 10,
    })
    const metamaskOptions = {
      seed: 'cover rival figure blast opinion catalog weather share sorry surround spin scene',
      password: '@Ntcnvtnfvfc1',
    }
    metamask = await dappeteer.getMetamask(browser, metamaskOptions)
    await metamask.closeNewsPopup()
    await metamask.switchNetwork('rinkeby')
  }, 60000);

  test('Goto local zkSync', async () => {
    walletPage = await browser.newPage()
    //var tempPage = await browser.newPage()
    //await tempPage.bringToFront()
    //await walletPage.goto('http://localhost:3000/')
    await walletPage.goto('https://zksync-vue-rinkeby-2--pr71-fix-onchain-cpk-ux3a8uav.web.app')
    //await walletPage.bringToFront()
    //await tempPage.close()
  }, 60000);

  test('Connect your wallet', async () => {
    await clickInnerText("Connect your wallet")
    await walletPage.evaluate(() => {
      const elements = [...document.querySelectorAll('*')]
      const element = elements.find(el => el.innerText === "MetaMask" && el.className === "bn-onboard-custom bn-onboard-icon-button svelte-1skxsnk")
      element.click()
    })
    await walletPage.waitForTimeout(1000)
  }, 60000);

  test('Choise account and connect zkSync', async () => {
    var pages = await browser.pages();
    metamaskPage = pages.find(e => e.url().match("chrome-extension://[a-z]+/home.html"))
    await metamask.approve(true)
    await metamaskPage.waitForTimeout(4000);
    await metamaskPage.reload();
    await metamask.sign()
  }, 60000);

  test('Click Deposit', async () => {
    await walletPage.bringToFront()
    await waitInnerText("+ Deposit")
    await clickInnerText("+ Deposit")
  }, 60000);

  test('Choise token', async () => {
    await waitInnerText("Select token")
    await clickInnerText("Select token")

    await waitInnerText("DAI")
    await clickInnerText("DAI")
    await walletPage.waitForTimeout(1000)
  }, 60000);

  test('Write token amount', async () => {
    await walletPage.focus('input')
    walletPage.keyboard.type('0.01')
    await walletPage.waitForTimeout(500)
  }, 60000);

  test('Approve token', async () => {
    await waitInnerText("Approve 0.01 DAI")
    await clickInnerText("Approve 0.01 DAI")
    await walletPage.waitForTimeout(500)

    metamask.confirmTransaction()
    await walletPage.waitForTimeout(2000)
  }, 60000);

  test('Proceed to deposit', async () => {
    await walletPage.bringToFront()
    await waitInnerText("Proceed to deposit")
    await clickInnerText("Proceed to deposit")

    await walletPage.waitForTimeout(500)
    metamask.confirmTransaction()
    await walletPage.waitForTimeout(2000)
    await walletPage.bringToFront()
  
    await waitInnerText("Ok")
    await clickInnerText("Ok")
  }, 60000);

  test('Close browser', async () => {
    await browser.close();
  }, 60000);
});
