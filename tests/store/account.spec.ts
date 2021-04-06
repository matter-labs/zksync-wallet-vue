import { AccountModuleState, getters, mutations, state } from "@/store/account";

let accountState: AccountModuleState;

describe("Account state", () => {
  beforeEach(() => {
    accountState = state();
  });

  describe("initState", () => {
    test("works", () => {
      expect(accountState.loggedIn).equal(false);
      expect(accountState.selectedWallet).equal("");
      expect(accountState.loadingHint).equal("");
      expect(accountState.address).equal("");
    });
  });
});

describe("Account mutations", () => {
  beforeEach(() => {
    accountState = state();
  });

  describe("setLoggedIn", () => {
    test("works", () => {
      mutations.setLoggedIn(accountState, true);
      expect(accountState.loggedIn).equal(true);
      mutations.setLoggedIn(accountState, false);
      expect(accountState.loggedIn).equal(false);
    });
  });
  describe("setSelectedWallet", () => {
    test("works", () => {
      mutations.setSelectedWallet(accountState, "Test");
      expect(accountState.selectedWallet).equal("Test");
      mutations.setSelectedWallet(accountState, "");
      expect(accountState.selectedWallet).equal("");
    });
  });
  describe("setLoadingHint", () => {
    test("works", () => {
      mutations.setLoadingHint(accountState, "Test");
      expect(accountState.loadingHint).equal("Test");
      mutations.setLoadingHint(accountState, "");
      expect(accountState.loadingHint).equal("");
    });
  });
  describe("setAddress", () => {
    test("works", () => {
      mutations.setAddress(accountState, "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
      expect(accountState.address).equal("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
      mutations.setAddress(accountState, "");
      expect(accountState.address).equal("");
    });
  });
});
describe("Account getters", () => {
  beforeEach(() => {
    accountState = state();
  });

  describe("loader", () => {
    test("works", () => {
      expect(getters.loader(accountState)).equal(false);
      mutations.setLoggedIn(accountState, false);
      mutations.setSelectedWallet(accountState, "Test");
      expect(getters.loader(accountState)).equal(true);
    });
  });
});
