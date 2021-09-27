import utils from "../../src/plugins/utils";

describe("plugins/utils", () => {
  describe("contendAddressToRawContentHash:", () => {
    it("throws when address is null", () => {
      const t = () => {
        utils.contendAddressToRawContentHash(null as any);
      };
      expect(t).toThrow();
    });

    it("throws when address is an invalid CIDv0", () => {
      const t = () => {
        utils.contendAddressToRawContentHash("QmWFmVZ8Swy9YNyNyL1uWBmWEf2KrJEqw5prPbmBufxsUl");
      };
      expect(t).toThrowError("Invalid CIDv0");
    });

    it("returns raw content hash for CIDv0", () => {
      const hash = utils.contendAddressToRawContentHash("QmWFmVZ8Swy9YNyNyL1uWBmWEf2KrJEqw5prPbmBufxsUM");
      expect(hash).toEqual("0x759d42f7c3051be8626757664e18da073219ac68548ab93e39f7ccafdf7fd132");
    });

    it("returns raw content hash for CIDv1", () => {
      const hash = utils.contendAddressToRawContentHash("bafybeidvtvbppqyfdpugez2xmzhbrwqhgim2y2curk4t4opxzsx5676rgi");
      expect(hash).toEqual("0x759d42f7c3051be8626757664e18da073219ac68548ab93e39f7ccafdf7fd132");
    });

    it("returns address without modification when it is a 32 bytes long hex", () => {
      const input = "0x759d42f7c3051be8626757664e18da073219ac68548ab93e39f7ccafdf7fd132";
      const hash = utils.contendAddressToRawContentHash(input);
      expect(hash).toEqual(input);
    });

    it("throws when address is not a valid raw content hash", () => {
      const t = () => {
        utils.contendAddressToRawContentHash("0x759d42f7c3051be8626757664e18da073219ac68548ab93e39f7ccafdf7fd1323");
      };
      expect(t).toThrowError("Invalid content hash");
    });

    it("throws when address is not a 32 bytes long raw content hash", () => {
      const t = () => {
        utils.contendAddressToRawContentHash("0x759d42f7c3051be8626757664e18da073219ac68548ab93e39f7ccafdf7fd13232");
      };
      expect(t).toThrowError("Content hash must be 32 bytes long");
    });
  });
});
