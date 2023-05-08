function DeepLinker(options: { onReturn: Function; onFallback: Function; onIgnored: Function }) {
  if (!options) {
    throw new Error("no options");
  }

  let hasFocus = true;
  let didHide = false;

  // window is blurred when dialogs are shown
  function onBlur() {
    hasFocus = false;
  }

  // document is hidden when native app is shown or browser is backgrounded
  function onVisibilityChange(e: any) {
    if (e.target.visibilityState === "hidden") {
      didHide = true;
    }
  }

  // window is focused when dialogs are hidden, or browser comes into view
  function onFocus() {
    if (didHide) {
      if (options.onReturn) {
        options.onReturn();
      }

      didHide = false; // reset
    } else if (!hasFocus && options.onFallback) {
      // ignore duplicate focus event when returning from native app on
      // iOS Safari 13.3+
      // wait for app switch transition to fully complete - only then is
      // 'visibilitychange' fired
      setTimeout(function () {
        // if browser was not hidden, the deep link failed
        if (!didHide) {
          options.onFallback();
        }
      }, 1000);
    }

    hasFocus = true;
  }

  // add/remove event listeners
  // `mode` can be "add" or "remove"
  function bindEvents(mode: string) {
    [
      [window, "blur", onBlur],
      [document, "visibilitychange", onVisibilityChange],
      [window, "focus", onFocus],
    ].forEach(function (conf: any) {
      conf[0][mode + "EventListener"](conf[1], conf[2]);
    });
  }

  // add event listeners
  bindEvents("add");

  // expose public API
  return {
    destroy: bindEvents.bind(null, "remove"),
    openURL: (url: string) => {
      // it can take a while for the dialog to appear
      const dialogTimeout = 500;

      setTimeout(function () {
        if (hasFocus && options.onIgnored) {
          options.onIgnored();
        }
      }, dialogTimeout);

      window.location = url as unknown as Location;
    },
  };
}

export default DeepLinker;
