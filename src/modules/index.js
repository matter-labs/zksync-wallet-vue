import { join } from "path";

export default function () {
  this.nuxt.hook("components:dirs", (dirs) => {
    dirs.push({
      path: join(__dirname, "components"),
      prefix: "zk",
    });
    dirs.push({
      path: join(__dirname, "blocks"),
      prefix: "zk-block",
    });
  });
  this.options.css.push(join(__dirname, "assets/style/main.scss"));
}

module.exports.meta = require("./package.json");
