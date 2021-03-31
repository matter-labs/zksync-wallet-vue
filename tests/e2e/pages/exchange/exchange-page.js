/* eslint-disable ui-testing/no-hard-wait */
/* eslint-disable cypress/no-unnecessary-waiting */
import Page from "../page";
import Header from "./header";
import Notifications from "./notifications";
import Onboard from "./onboard";

export default class ExchangePage extends Page {
  constructor() {
    super();
    this.header = new Header();
    this.onboard = new Onboard();
    this.notifications = new Notifications();
  }

  getCurrencyAmount() {
    return cy.findByTestId("left-side").findByTestId("currency-amount");
  }

  getSubmitOrderBtn() {
    return cy.findByTestId("submit-order");
  }

  visit(pair) {
    if (pair) {
      cy.visit(`/exchange/${pair}`);
    } else {
      cy.visit("/exchange");
    }
  }

  connectMetamaskWallet() {
    const connectWalletButton = this.header.getConnectWalletBtn();
    connectWalletButton.click();
    const onboardMetamaskButton = this.onboard.getMetamaskBtn();
    onboardMetamaskButton.click();
  }

  waitUntilLoggedIn() {
    cy.waitUntil(() => {
      const walletButton = this.header.getWalletButton();
      return walletButton.should("exist");
    });
    // waiting for wallet button is not enough in rare cases to be logged in
    cy.wait(2000);
  }

  getLoggedInWalletAddress() {
    const walletButton = this.header.getWalletButton();
    return walletButton.invoke("text");
  }

  waitForTransactionSuccess() {
    cy.waitUntil(
      () => {
        const txSuccessNotification = this.notifications.getTransactionSuccessNotification();
        return txSuccessNotification.should("exist");
      },
      {
        timeout: 60000,
      },
    );
  }

  getTransactionUrl() {
    const txUrl = this.notifications.getTransactionSuccessNotificationLink();
    return txUrl.invoke("attr", "href");
  }
}
