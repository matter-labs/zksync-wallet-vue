import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";

/**
 * Add here external dependencies that actually you use.
 */
const externals = ["firebase-functions", "firebase-admin", "node-fetch"];

export default {
  input: "src/index.ts",
  external: externals,
  plugins: [
    typescript(),
    nodeResolve()
  ],
  onwarn: () => {return},
  output: {
    file: "lib/index.js",
    format: "es",
    sourcemap: false,
  },
};