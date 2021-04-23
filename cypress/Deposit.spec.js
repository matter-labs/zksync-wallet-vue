// Deposit.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
describe('Deposit token', () => {
    it('select token and deposit', () => {
        cy.visit('https://zksync-vue-rinkeby-dev--dev-xfxbk2xa.web.app/account/');
        cy.get('.walletPage > div').click();
        cy.get('.button:nth-child(1)').click();
        cy.get('.-link').click();
        cy.get('.tokenItem:nth-child(2)').click();
        cy.get('.-appended input').type('1');
        cy.get('.\_margin-top-1 > span').click();
        cy.visit('https://zksync-vue-rinkeby-dev--dev-xfxbk2xa.web.app/account/');
    })
})