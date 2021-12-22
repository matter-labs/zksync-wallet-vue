import { Plugin } from "@nuxt/types";
import mixpanel from "mixpanel-browser";

export type Analytics = {
  track(eventName: string, props?: any): void;
  set(props: { [key: string]: string }): void;
};

class MixpanelAnalytics implements Analytics {
  constructor(token: string) {
    mixpanel.init(token, { debug: false });
  }

  set(props: { [key: string]: string }): void {
    mixpanel.register(props);
  }

  track(eventName: string, props?: any): void {
    mixpanel.track(eventName, props);
  }
}

class ConsoleAnalytics implements Analytics {
  props = {};
  set(props: { [key: string]: string }): void {
    for (const key of Object.keys(props)) {
      this.props[key] = props[key];
    }
  }

  track(eventName: string, props?: any): void {
    console.log("Track:", eventName, { ...this.props, ...props });
  }
}

const plugin: Plugin = (_, inject) => {
  inject("analytics", process.env.NODE_ENV === "production" ? new MixpanelAnalytics(process.env.MIXPANEL_TOKEN!) : new ConsoleAnalytics());
};

export default plugin;
