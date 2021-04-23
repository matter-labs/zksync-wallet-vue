
describe('Login to zkWallet', () => {
    it('select wallet and connect', () => {
        cy.visit('https://zksync-vue-rinkeby-dev--dev-xfxbk2xa.web.app/account/');
        cy.get('.indexPage > .container').click();
        cy.get('.tile > img').click();
        cy.get('.svelte-q1527:nth-child(1) .svelte-1skxsnk:nth-child(2)').click();
    })
})