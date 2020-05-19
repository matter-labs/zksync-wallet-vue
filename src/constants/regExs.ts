export const ADDRESS_VALIDATION = {
  sync: /^sync:[a-z0-9]*$/,
  eth: /^0x[a-fA-F0-9]{40}$/,
};

export const INPUT_VALIDATION = {
  digits: /^[0-9]*\.?[0-9]*$/,
};

export const MOBILE_DEVICE = /mobi/i;

export const OPERA_DETECT = navigator.userAgent.match(/Opera|OPR\//);

export const WRONG_NETWORK = /(?:wrong\snetwork)|deployed/i;
