import { Plugin } from "@nuxt/types";
import mixpanel from "mixpanel-browser";

export type Analytics = {
  identify(identity: string): void;
  track(eventName: string, props?: any): void;
};

class MixpanelAnalytics implements Analytics {
  constructor(token: string) {
    mixpanel.init(token, { debug: true });
  }

  identify(identity: string) {
    mixpanel.identify(identity);
  }

  track(eventName: string, props?: any): void {
    mixpanel.track(eventName, props);
  }
}

class ConsoleAnalytics implements Analytics {
  identify(identity: string): void {
    console.log("Identify:", identity);
  }

  track(eventName: string, props?: any): void {
    console.log("Track:", eventName, props);
  }
}

const plugin: Plugin = (_, inject) => {
  inject("analytics", process.env.NODE_ENV === "production" ? new MixpanelAnalytics(process.env.MIXPANEL_TOKEN!) : new ConsoleAnalytics());
};

export default plugin;
