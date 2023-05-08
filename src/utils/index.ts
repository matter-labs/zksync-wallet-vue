import { utils } from "ethers";
import type { BigNumberish } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";
import { RestProvider } from "zksync";
import { Address, TokenLike } from "zksync/build/types";
import { DecimalBalance } from "@/types/zksync";

export function parseDecimal(provider: RestProvider, symbol: TokenLike, amount: DecimalBalance) {
  return provider.tokenSet.parseToken(symbol, amount.toString());
}

export function parseBigNumberish(provider: RestProvider, symbol: TokenLike, amount: BigNumberish) {
  try {
    const result = provider.tokenSet.formatToken(symbol, amount);
    if (result === undefined) {
      return "0";
    }
    return result && result.endsWith(".0") ? result.substr(0, result.length - 2) : result;
  } catch (error) {
    console.warn(`Error parsing BigNumberish for token ${symbol} with amount ${amount}\n`, error);
  }
}

/**
 * Rounds and limits BigNumber to Decimal with the exact limit of symbols
 * @author: S.Beresnev
 */
export function formatBigNumLimited(provider: RestProvider, symbol: TokenLike, amount: BigNumberish, maxLength: number = 5) {
  const numString: string | undefined = parseBigNumberish(provider, symbol, amount);
  if (!numString || numString.length < maxLength + 1) {
    return numString;
  }
  const splittedNumString = numString.split(".");
  const intPart = splittedNumString[0];
  if (intPart.length > maxLength) {
    return `~${intPart.slice(0, maxLength - 3)}⋆⋆⋆${intPart.slice(intPart.length - 3)}`;
  }
  if (splittedNumString.length < 2) {
    return intPart;
  }
  const fractionPart = splittedNumString[1] as string;
  const fractionLimit = Math.max(1, Math.min(maxLength - intPart.length, 4));
  if (fractionPart.length > fractionLimit) {
    const roundedFraction = parseFloat(parseFloat(`0.${fractionPart}`).toFixed(fractionLimit));
    if (roundedFraction > 0) {
      return `~${intPart}${roundedFraction.toString().slice(1)}`;
    }
    return `~${intPart}.${"00001".slice(5 - fractionLimit)}`;
  }
  return `~${intPart}.${fractionPart}`;
}

export function validateAddress(address: Address) {
  return isAddress(address);
}

export function searchByKey(obj: Object, searchValue: string) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => key.toLowerCase().includes(searchValue.toLowerCase())));
}

export function searchInObject(obj: Object, searchStr: string, searchParam: (e: [string, any]) => string) {
  if (!searchStr.trim()) {
    return obj;
  }
  searchStr = searchStr.trim().toLowerCase();
  return Object.fromEntries(Object.entries(obj).filter(([key, item]) => searchParam([key, item]).toLowerCase().includes(searchStr)));
}

export function formattedPrice(price: number, amount: number) {
  const total = price * amount;
  if (!amount || total === 0) {
    return "$0.00";
  }
  return total < 0.01 ? "<$0.01" : `~$${total.toFixed(2)}`;
}

export function formatTxHash(txHash: string) {
  if (typeof txHash !== "string") {
    return;
  }
  if (txHash.startsWith("sync-tx:")) {
    txHash = txHash.substr("sync-tx:".length, txHash.length);
  }
  if (!txHash.startsWith("0x")) {
    txHash = "0x" + txHash;
  }
  return txHash;
}

export function contendAddressToRawContentHash(address: string): string {
  // CIDv0
  if (address?.startsWith("Qm")) {
    try {
      const cid = CID.parse(address, base58btc.decoder);
      return utils.hexlify(cid.toV1().bytes.slice(4));
    } catch (e) {
      throw new Error("Invalid CIDv0");
    }
  }

  let cid;
  try {
    cid = CID.parse(address);
  } catch (e) {}

  // CIDv1
  if (cid) {
    try {
      return utils.hexlify(cid.bytes.slice(4));
    } catch (e) {
      throw new Error("Invalid CIDv1");
    }
  }

  // Raw Content Hash
  let bytes;
  try {
    utils.hexlify(address);
    bytes = utils.arrayify(address);
  } catch (e) {
    throw new Error("Invalid content hash");
  }

  if (bytes.length !== 32) {
    throw new Error("Content hash must be 32 bytes long");
  }

  return address;
}

export function isCID(address: string): boolean {
  try {
    CID.parse(address, address?.startsWith("Qm") ? base58btc.decoder : undefined);
    return true;
  } catch {
    return false;
  }
}

export function copyToClipboard(value: string) {
  const elem = document.createElement("textarea");
  elem.style.position = "absolute";
  elem.style.left = -99999999 + "px";
  elem.style.top = -99999999 + "px";
  elem.value = value;
  document.body.appendChild(elem);
  elem.select();
  document.execCommand("copy");
  document.body.removeChild(elem);
}

export function filterError(error: Error): string | undefined {
  if (error.message) {
    if (
      error.message.includes("User denied") ||
      error.message.includes("User rejected") ||
      // eslint-disable-next-line quotes
      error.message.includes('"Request rejected"') ||
      error.message.includes("Actionscancelled by user") // typo in imToken message rejection
    ) {
      return undefined;
    } else if (error.message.includes("Fee Amount is not packable")) {
      return "Fee Amount is not packable";
    } else if (error.message.includes("Transaction Amount is not packable")) {
      return "Transaction Amount is not packable";
    } else if (error.message.includes("Fee is to low")) {
      return "Transaction fee was to low. Try again.";
    }
    return error.message;
  }
  return "Unknown error";
}

export function getMobileOperatingSystem(): "iOS" | "Android" | "unknown" {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return "iOS";
  } else if (userAgent.match(/Android/i)) {
    return "Android";
  } else {
    return "unknown";
  }
}

export function isMobileDevice(): boolean {
  const operatingSystem = getMobileOperatingSystem();
  return operatingSystem === "iOS" || operatingSystem === "Android";
}
