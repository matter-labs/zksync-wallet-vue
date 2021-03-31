import utils from "@/plugins/utils";

describe("getFormattedTotalPrice", () => {
  test("works", () => {
    expect(utils.getFormattedTotalPrice(1, 1)).equal("~$1.00");
    expect(utils.getFormattedTotalPrice(1, 0)).equal("$0.00");
    expect(utils.getFormattedTotalPrice(1, 0.0000001)).equal("<$0.01");
  });
});

describe("validateAddress", () => {
  test("works", () => {
    expect(utils.validateAddress("")).equal(false);
    expect(utils.validateAddress("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0")).equal(true);
    expect(utils.validateAddress("0x312acE2a5Ff774416666B9866F48a8FA9513A517")).equal(true);
    expect(utils.validateAddress("0x312AcE2a5Ff774416666B9866F48a8FA9513A517")).equal(false);
    expect(utils.validateAddress("0x312acE2a5Ff974416666B9866F48a8FA9513A517")).equal(false);
    expect(utils.validateAddress("0x12acE2a5Ff974416666B9866F48a8FA9513A517")).equal(false);
  });
});

describe("isAmountPackable", () => {
  test("works", () => {
    expect(utils.isAmountPackable("10000000000000")).equal(true);
    expect(utils.isAmountPackable("100000000000000000")).equal(true);
    expect(utils.isAmountPackable("10")).equal(true);
    expect(utils.isAmountPackable("1")).equal(true);
    expect(utils.isAmountPackable("0")).equal(true);
    expect(utils.isAmountPackable("123456789987654321")).equal(false);
  });
});
