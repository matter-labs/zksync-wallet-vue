describe("Deposit", () => {
  const puppeteer = require('puppeteer');
  const dappeteer = require('@warsmit/dappeteer');
  var browser;
  var metamask;
  var walletPage;
  var metamaskPage;
  let buttonsId = require('@tests/buttons_id.json');

  const clickInnerText = text => {
    return walletPage.evaluate(text => [...document.querySelectorAll('*')].find(e => e.innerText === text).click(), text)
  }
  const waitInnerText = text => {
    return walletPage.waitForFunction(text => [...document.querySelectorAll('*')].find(e => e.innerText === text), {}, text)
  }

  const clickID = text => {
    return walletPage.evaluate(text => [...document.querySelectorAll('*')].find(e => e.id === text).click(), text)
  }
  const waitID = text => {
    return walletPage.waitForFunction(text => [...document.querySelectorAll('*')].find(e => e.id === text), {timeout: 60000}, text)
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
    await walletPage.goto('http://localhost:3000/')
    //await walletPage.goto('https://zksync-vue-rinkeby-2--pr71-fix-onchain-cpk-ux3a8uav.web.app')
    //await walletPage.bringToFront()
    //await tempPage.close()
  }, 60000);

  test('Connect your wallet', async () => {
    await clickID(buttonsId.elements.connect_wallet_button)
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
    await waitID(buttonsId.account.deposit)
    await clickID(buttonsId.account.deposit)
  }, 60000);

  test('Choise token', async () => {
    await waitID(buttonsId.amount_block.token_input)
    await clickID(buttonsId.amount_block.token_select)

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
    await waitID(buttonsId.deposit.approve)
    await clickID(buttonsId.deposit.approve)
    await walletPage.waitForTimeout(500)

    metamask.confirmTransaction()
    await walletPage.waitForTimeout(2000)
  }, 60000);

  test('Proceed to deposit', async () => {
    await walletPage.bringToFront()
    await waitID(buttonsId.deposit.proceed_to_deposit)
    await clickID(buttonsId.deposit.proceed_to_deposit)

    await walletPage.waitForTimeout(500)
    metamask.confirmTransaction()
    await walletPage.waitForTimeout(2000)
    await walletPage.bringToFront()
  
    await waitID(buttonsId.success_block.ok)
    await clickID(buttonsId.success_block.ok)
  }, 60000);

  test('Close browser', async () => {
    await browser.close();
  }, 60000);
});
