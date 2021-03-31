import Page from "../page";

export default class Header extends Page {
  getConnectWalletBtn() {
    return cy.findByTestId("connect-wallet");
  }

  getWalletButton() {
    return cy.findByTestId("wallet-btn");
  }
}
