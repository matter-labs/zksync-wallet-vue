import { AccountModuleState, state, mutations, getters } from "@/store/account";
import { setupTest } from "@nuxt/test-utils/dist";

describe("Integration tests for the stores as a data-models", () => {
  setupTest({
    testDir: __dirname,
    config: {
      myModule: {
        test: 123,
      },
    },
  });

  test("initState", () => {
    expect(accountState.loggedIn).toBe(false);
    expect(accountState.selectedWallet).toBe("");
    expect(accountState.loadingHint).toBe("");
    expect(accountState.address).toBe("");
  });
});

let accountState: AccountModuleState;

describe("Account state", () => {
  beforeEach(() => {});

  describe("", () => {
    test("works", () => {});
  });
});

describe("Account mutations", () => {
  beforeEach(() => {
    accountState = state();
  });

  describe("setLoggedIn", () => {
    test("works", () => {
      mutations.setLoggedIn(accountState, true);
      expect(accountState.loggedIn).toBe(true);
      mutations.setLoggedIn(accountState, false);
      expect(accountState.loggedIn).toBe(false);
    });
  });
  describe("setSelectedWallet", () => {
    test("works", () => {
      mutations.setSelectedWallet(accountState, "Test");
      expect(accountState.selectedWallet).toBe("Test");
      mutations.setSelectedWallet(accountState, "");
      expect(accountState.selectedWallet).toBe("");
    });
  });
  describe("setLoadingHint", () => {
    test("works", () => {
      mutations.setLoadingHint(accountState, "Test");
      expect(accountState.loadingHint).toBe("Test");
      mutations.setLoadingHint(accountState, "");
      expect(accountState.loadingHint).toBe("");
    });
  });
  describe("setAddress", () => {
    test("works", () => {
      mutations.setAddress(accountState, "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
      expect(accountState.address).toBe("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
      mutations.setAddress(accountState, "");
      expect(accountState.address).toBe("");
    });
  });
});
describe("Account getters", () => {
  beforeEach(() => {
    accountState = state();
  });

  describe("loader", () => {
    test("works", () => {
      expect(getters.loader(accountState)).toBe(false);
      mutations.setLoggedIn(accountState, false);
      mutations.setSelectedWallet(accountState, "Test");
      expect(getters.loader(accountState)).toBe(true);
    });
  });
});
