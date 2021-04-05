import { TokensModuleState, state } from "@/store/tokens";

let TokensModuleStateInstance: TokensModuleState;

describe("Wallet Store check", () => {
  beforeEach(() => {
    TokensModuleStateInstance = state();
  });
});
