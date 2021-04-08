import utils from "@/plugins/utils";

describe("getFormattedTotalPrice", () => {
  test("works", () => {
    expect(utils.getFormattedTotalPrice(1, 1)).toBe("~$1.00");
    expect(utils.getFormattedTotalPrice(1, 0)).toBe("$0.00");
    expect(utils.getFormattedTotalPrice(1, 0.0000001)).toBe("<$0.01");
  });
});

describe("validateAddress", () => {
  test("works", () => {
    expect(utils.validateAddress("")).toEqual(false);
    expect(utils.validateAddress("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0")).toBe(true);
    expect(utils.validateAddress("0x312acE2a5Ff774416666B9866F48a8FA9513A517")).toBe(true);
    expect(utils.validateAddress("0x312AcE2a5Ff774416666B9866F48a8FA9513A517")).toBe(false);
    expect(utils.validateAddress("0x312acE2a5Ff974416666B9866F48a8FA9513A517")).toBe(false);
    expect(utils.validateAddress("0x12acE2a5Ff974416666B9866F48a8FA9513A517")).toBe(false);
  });
});

describe("isAmountPackable", () => {
  test("works", () => {
    expect(utils.isAmountPackable("10000000000000")).toBe(true);
    expect(utils.isAmountPackable("100000000000000000")).toBe(true);
    expect(utils.isAmountPackable("10")).toBe(true);
    expect(utils.isAmountPackable("1")).toBe(true);
    expect(utils.isAmountPackable("0")).toBe(true);
    expect(utils.isAmountPackable("123456789987654321")).toBe(false);
  });
});
