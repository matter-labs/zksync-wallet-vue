import { Plugin } from "@nuxt/types";
import mixpanel from "mixpanel-browser";

export type Analytics = {
  track(eventName: string, props?: any): void;
};

class MixpanelAnalytics implements Analytics {
  constructor(token: string) {
    mixpanel.init(token, { debug: false });
  }

  track(eventName: string, props?: any): void {
    mixpanel.track(eventName, props);
  }
}

class ConsoleAnalytics implements Analytics {
  track(eventName: string, props?: any): void {
    console.log("Track:", eventName, props);
  }
}

const plugin: Plugin = (_, inject) => {
  inject("analytics", process.env.NODE_ENV === "production" ? new MixpanelAnalytics(process.env.MIXPANEL_TOKEN!) : new ConsoleAnalytics());
};

export default plugin;
