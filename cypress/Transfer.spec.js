describe('Transfer token', () => {
    it('from token page select token and transfer to address', () => {
        cy.visit('https://zksync-vue-rinkeby-dev--dev-xfxbk2xa.web.app/account/');
        cy.get('.walletPage > div').click();
        cy.get('.\_margin-y-1').click();
        cy.get('.column > .button').click();
        cy.get('.contactItem:nth-child(1)').click();
        cy.get('.form-input-append > .button').click();
        cy.get('#modal-wd1gj8bxt .tokenItem:nth-child(3)').click();
        cy.get('.linkText:nth-child(2)').click();
        cy.get('span:nth-child(2) > span').click();
    })
})
