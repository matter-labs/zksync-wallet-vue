import { arrayify } from "ethers/lib/utils";
import { CID } from "multiformats/cid";

export function getCIDFromContentHash(contentHash: string) {
  try {
    return CID.decode(new Uint8Array([1, 113, 18, 32, /* CIDv2 PrefixB */ ...arrayify(contentHash)])).toString();
  } catch (error) {
    return undefined;
  }
}
