import { Route } from "vue-router/types";

export interface ZKIRootState {
  accountModalOpened: boolean;
  currentModal?: string;
  previousRoute?: Route;
}

export declare interface SingleIcon {
  name: string;
  img: string;
  url: string;
  hideIn?: string;
}
