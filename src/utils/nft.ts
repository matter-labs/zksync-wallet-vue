import { arrayify } from "ethers/lib/utils";
import { CID } from "multiformats/cid";

export function getCIDFromContentHash(contentHash: string) {
  try {
    const decoded = CID.decode(new Uint8Array([18, 32, ...arrayify(contentHash)]));
    const cid = new CID(0, 112, decoded.multihash, decoded.bytes);
    return cid.toString();
  } catch (error) {
    return undefined;
  }
}
