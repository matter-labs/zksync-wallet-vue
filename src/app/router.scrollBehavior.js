// eslint-disable-next-line require-await
export default async function (to, from, savedPosition) {
  if (to.path !== from.path) {
    this.app.$accessor.scroll.setLastPath(from.path);
    this.app.$accessor.scroll.setLastScroll(savedPosition);
  }

  if (savedPosition) {
    return savedPosition;
  }

  const findEl = (hash, x) => {
    return (
      document.querySelector(hash) ||
      new Promise((resolve) => {
        if (x > 100) {
          return resolve();
        }
        setTimeout(() => {
          resolve(findEl(hash, ++x || 1));
        }, 200);
      })
    );
  };

  if (to.hash) {
    const el = findEl(to.hash);
    // @ts-ignore
    const offsetTop = el.getBoundingClientRect().top + window.pageYOffset;
    if ("scrollBehavior" in document.documentElement.style) {
      return window.scrollTo({ top: offsetTop, behavior: "smooth" });
    } else {
      return window.scrollTo(0, offsetTop);
    }
  }

  return { x: 0, y: 0 };
}
