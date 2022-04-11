import Vue from "vue";

export default (ctx: Vue, defaultPath: string) => {
  return ctx.fromRoute &&
    ctx.fromRoute.fullPath !== ctx.$route.fullPath &&
    !ctx.fromRoute.path.startsWith("/transaction/")
    ? ctx.fromRoute
    : defaultPath;
};
