describe("Withdraw", () => {
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
    return walletPage.waitForFunction(text => [...document.querySelectorAll('*')].find(e => e.innerText === text), {timeout: 60000}, text)
  }
  const waitEnabledInnerText = text => {
    return walletPage.waitForFunction(text => [...document.querySelectorAll('*')].find(e => e.innerText === text && e.disabled === false), {timeout: 60000}, text)
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
      args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`
      ],
      executablePath: process.env.PUPPETEER_EXEC_PATH,
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
    var tempPage = await browser.newPage()
    await tempPage.bringToFront()
    await walletPage.goto('http://localhost:3000/')
    //await walletPage.goto('https://zksync-vue-rinkeby-2--pr71-fix-onchain-cpk-ux3a8uav.web.app')
    await walletPage.bringToFront()
    await tempPage.close()
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

  test('Select \'- Withdraw\'', async () => {
    await walletPage.bringToFront()
    await waitID(buttonsId.account.withdraw)
    await clickID(buttonsId.account.withdraw)
  }, 60000);

  test('Write address', async () => {
    await waitInnerText("Address")
    await walletPage.focus('input.walletAddress')
    walletPage.keyboard.type('0x7519bf7a23e98dAa9859D301C1066eFAA42054dD')
    await walletPage.waitForTimeout(500)
  }, 60000);

  test('Choise token', async () => {
    await waitID(buttonsId.amount_block.token_input)
    await clickID(buttonsId.amount_block.token_select)
    await waitInnerText("DAI")
    await clickInnerText("DAI")
    await walletPage.waitForTimeout(1000)
  }, 60000);

  test('Write token amount', async () => {
    await waitInnerText("Amount")
    await walletPage.focus('div.amountInput input')
    walletPage.keyboard.type('0.01')
    await walletPage.waitForTimeout(500)
  }, 60000);

  test('Withdraw', async () => {
    await waitID(buttonsId.withdraw.withdraw)
    await clickID(buttonsId.withdraw.withdraw)
    await walletPage.waitForTimeout(1000)
    await metamask.sign()
    await walletPage.waitForTimeout(2000)
    await walletPage.bringToFront()
    await waitID(buttonsId.success_block.ok)
    await clickID(buttonsId.success_block.ok)
    await walletPage.waitForTimeout(2000)
  }, 60000);

  test('Select \'  Transfer\'', async () => {
    await waitID(buttonsId.account.transfer)
    await clickID(buttonsId.account.transfer)
  }, 5000);

  test('Write address', async () => {
    await waitInnerText("Address")
    await walletPage.focus('input.walletAddress')
    walletPage.keyboard.type('0x7519bf7a23e98dAa9859D301C1066eFAA42054dD')
    await walletPage.waitForTimeout(500)
  }, 5000);

  test('Choise token', async () => {
    await waitID(buttonsId.amount_block.token_select)
    await clickID(buttonsId.amount_block.token_select)
    await waitInnerText("DAI")
    await clickInnerText("DAI")
    await walletPage.waitForTimeout(1000)
  }, 5000);

  test('Write token amount', async () => {
    await waitInnerText("Amount")
    await walletPage.focus('div.amountInput input')
    walletPage.keyboard.type('0.01')
    await walletPage.waitForTimeout(500)
  }, 5000);

  test('Transfer', async () => {
    await waitID(buttonsId.transfer.transfer)
    await clickID(buttonsId.transfer.transfer)
    await walletPage.waitForTimeout(1000)
    await metamask.sign()
    await walletPage.waitForTimeout(2000)
    await walletPage.bringToFront()
    await waitID(buttonsId.success_block.ok)
    await clickID(buttonsId.success_block.ok)
  }, 60000);

  test('Close browser', async () => {
    await browser.close();
  }, 60000);
});
