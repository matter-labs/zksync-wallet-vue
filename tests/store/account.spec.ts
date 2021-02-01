import { AccountModuleState, state, mutations, getters } from '@/store/account';
import { state as RootState, getters as RootGetters } from '@/store';

let accountState: AccountModuleState;

describe('Account state', () => {
    beforeEach(() => {
        accountState = state();
    });

    describe('initState', () => {
        test('works', () => {
            expect(accountState.loggedIn).toEqual(false);
            expect(accountState.selectedWallet).toEqual("");
            expect(accountState.loadingHint).toEqual("");
            expect(accountState.address).toEqual("");
        });
    });
});

describe('Account mutations', () => {
    beforeEach(() => {
        accountState = state();
    });

    describe('setLoggedIn', () => {
        test('works', () => {
            mutations.setLoggedIn(accountState, true);
            expect(accountState.loggedIn).toEqual(true);
            mutations.setLoggedIn(accountState, false);
            expect(accountState.loggedIn).toEqual(false);
        });
    });
    describe('setSelectedWallet', () => {
        test('works', () => {
            mutations.setSelectedWallet(accountState, "Test");
            expect(accountState.selectedWallet).toEqual("Test");
            mutations.setSelectedWallet(accountState, "");
            expect(accountState.selectedWallet).toEqual("");
        });
    });
    describe('setLoadingHint', () => {
        test('works', () => {
            mutations.setLoadingHint(accountState, "Test");
            expect(accountState.loadingHint).toEqual("Test");
            mutations.setLoadingHint(accountState, "");
            expect(accountState.loadingHint).toEqual("");
        });
    });
    describe('setAddress', () => {
        test('works', () => {
            mutations.setAddress(accountState, "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
            expect(accountState.address).toEqual("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
            mutations.setAddress(accountState, "");
            expect(accountState.address).toEqual("");
        });
    });
});
describe('Account getters', () => {
    beforeEach(() => {
        accountState = state();
    });

    describe('loader', () => {
        test('works', () => {
            expect(getters.loader(accountState, getters, RootState(), RootGetters)).toEqual(false);
            mutations.setLoggedIn(accountState, false);
            mutations.setSelectedWallet(accountState, "Test");
            expect(getters.loader(accountState, getters, RootState(), RootGetters)).toEqual(true);
        });
    });
});