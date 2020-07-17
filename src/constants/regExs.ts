export const ADDRESS_VALIDATION = {
  sync: /^sync:[a-z0-9]*$/,
  eth: /^0x[a-fA-F0-9]{40}$/,
};

export const INPUT_VALIDATION = {
  digits: /^[0-9]*\.?[0-9]*$/,
};

export const ALL_APPLE_DEVICES = /ipad|iphone|macintosh|macintel|MacPPC|Mac68K/i;

export const MOBILE_DEVICE = /mobi/i;

export const WRONG_NETWORK = /(?:wrong\snetwork)|deployed/i;
