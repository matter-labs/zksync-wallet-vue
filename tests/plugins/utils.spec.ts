import utils from '@/plugins/utils';

describe('getFormatedTotalPrice', () => {
    test('works', () => {
        expect(utils.getFormatedTotalPrice(1,1)).toEqual("~$1.00");
        expect(utils.getFormatedTotalPrice(1,0)).toEqual("$0.00");
        expect(utils.getFormatedTotalPrice(1,0.0000001)).toEqual("<$0.01");
    });
});

describe('validateAddress', () => {
    test('works', () => {
        expect(utils.validateAddress("")).toEqual(false);
        expect(utils.validateAddress("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0")).toEqual(true);
        expect(utils.validateAddress("0x312acE2a5Ff774416666B9866F48a8FA9513A517")).toEqual(true);
        expect(utils.validateAddress("0x312AcE2a5Ff774416666B9866F48a8FA9513A517")).toEqual(false);
        expect(utils.validateAddress("0x312acE2a5Ff974416666B9866F48a8FA9513A517")).toEqual(false);
        expect(utils.validateAddress("0x12acE2a5Ff974416666B9866F48a8FA9513A517")).toEqual(false);
    });
});

describe('isAmountPackable', () => {
    test('works', () => {
        expect(utils.isAmountPackable("10000000000000")).toEqual(true);
        expect(utils.isAmountPackable("100000000000000000")).toEqual(true);
        expect(utils.isAmountPackable("10")).toEqual(true);
        expect(utils.isAmountPackable("1")).toEqual(true);
        expect(utils.isAmountPackable("0")).toEqual(true);
        expect(utils.isAmountPackable("123456789987654321")).toEqual(false);
    });
});