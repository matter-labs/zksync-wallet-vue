import { walletData } from "@/plugins/walletData";
import { DecimalBalance, GweiBalance, ZkInBalance, ZkInNFT, ZKTypeDisplayToken } from "@/types/lib";
import { IPrototype } from "@inkline/inkline/src/plugin.d";

import { BigNumber, BigNumberish, utils } from "ethers";
import { utils as zkUtils } from "zksync";
import { Address, TokenSymbol } from "zksync/build/types";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";

/**
 *
 * @param symbol
 * @param amount
 * @return {BigNumber|*}
 */
function parseToken(symbol: TokenSymbol, amount: DecimalBalance) {
  return walletData.get().syncProvider?.tokenSet?.parseToken(symbol, amount.toString()) || BigNumber.from("0");
}

export function capitalize(s: string): string {
  if (s?.length) {
    return s.charAt(0).toLocaleUpperCase() + s.slice(1);
  }
  return "";
}

/**
 * Formatting token amount output to human readable string
 *
 * @param {TokenSymbol} symbol
 * @param {GweiBalance} amount
 * @return {string}
 */
function handleFormatToken(symbol: TokenSymbol, amount: GweiBalance): string {
  if (!amount) return "0";
  const result: string | undefined = walletData.get().syncProvider?.tokenSet?.formatToken(symbol, amount);
  if (result === undefined) {
    return "0";
  }
  return result && result.endsWith(".0") ? result.substr(0, result.length - 2) : result;
}

export function contendAddressToRawContentHash(address: string): string {
  // CIDv0
  if (address?.startsWith("Qm")) {
    try {
      const cid = CID.parse(address, base58btc.decoder);
      return utils.hexlify(cid.bytes.slice(2));
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
      return utils.hexlify(cid.bytes.slice(2));
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

export default {
  parseToken,
  contendAddressToRawContentHash,
  timeCalc: (timeInSec: number) => {
    const hours = Math.floor(timeInSec / 60 / 60);
    const minutes = Math.floor(timeInSec / 60) - hours * 60;
    const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

    const strArr = [];
    if (hours) {
      strArr.push(`${hours} hours`);
    }
    if (minutes) {
      strArr.push(`${minutes} minutes`);
    }
    if (seconds) {
      strArr.push(`${seconds} seconds`);
    }

    return strArr.join(" ");
  },

  handleFormatToken,

  getFormattedTotalPrice: (price: number, amount: number) => {
    const total = price * amount;
    if (!amount || total === 0) {
      return "$0.00";
    }
    return total < 0.01 ? "<$0.01" : `~$${total.toFixed(2)}`;
  },

  /**
   * @param a
   * @param b
   * @return {number}
   */
  compareTokensById: (a: ZkInBalance | ZkInNFT, b: ZkInBalance | ZkInNFT) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    }
    return 0;
  },

  /**
   * Soring by the token name
   * @param {ZkInBalance} a
   * @param {ZkInBalance} b
   * @returns {number}
   */
  sortBalancesAZ: (a: ZkInBalance, b: ZkInBalance) => {
    return a.symbol.localeCompare(b.symbol);
  },

  isAmountPackable: (amount: BigNumberish): boolean => {
    return zkUtils.isTransactionAmountPackable(amount);
  },

  validateAddress: (address: Address): boolean => {
    return utils.isAddress(address);
  },

  searchInArr: (search: string, list: Array<unknown> | ZKTypeDisplayToken[], searchParam: (e: unknown) => string) => {
    if (!search.trim()) {
      return list;
    }
    search = search.trim().toLowerCase();
    return list.filter((e) => String(searchParam(e)).toLowerCase().includes(search));
  },

  /**
   * Pre-processes any error to mute complex IT-debug and turn it into the human-readable text
   *
   * @param {Error} error
   * @return {string | undefined}
   */
  filterError: (error: Error): string | undefined => {
    if (!error.message) {
      return undefined;
    }

    if (error.message.includes("Fee Amount is not packable")) {
      return "Fee Amount is not packable";
    } else if (error.message.includes("Transaction Amount is not packable")) {
      return "Transaction Amount is not packable";
    }
    return error.message.length < 150 && error.message.search(/denied|rejected/) === -1 ? error.message : undefined;
  },

  /**
   * Theme definition moved to the utility plugin
   * @param {IPrototype} inklineContext
   * @param {boolean} toggleTheme
   * @return {"light" | "dark"}
   */
  defineTheme(inklineContext: IPrototype, toggleTheme = false): "light" | "dark" {
    let mode: string | null | undefined = localStorage.getItem("colorTheme");
    if (toggleTheme) {
      mode = inklineContext.config.variant = mode === "light" ? "dark" : "light";
    }
    if (mode && ["light", "dark"].includes(mode)) {
      inklineContext.config.variant = mode === "light" ? "light" : "dark";
    }
    localStorage.setItem("colorTheme", inklineContext.config.variant);
    return inklineContext.config.variant;
  },

  /**
   * Copy text
   */
  copy(value: string) {
    const elem = document.createElement("textarea");
    elem.style.position = "absolute";
    elem.style.left = -99999999 + "px";
    elem.style.top = -99999999 + "px";
    elem.value = value;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
  },
};
