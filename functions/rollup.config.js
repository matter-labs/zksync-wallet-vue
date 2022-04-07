import typescript from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"

/**
 * Add here external dependencies that actually you use.
 */
const externals = ["firebase-functions",
  "firebase-admin",
  "node-fetch",
  "cors"]

export default {
  input: "src/index.ts",
  external: externals,
  plugins: [
    typescript({ sourceMap: false }),
    resolve({
      moduleDirectories: ["node_modules"]
    })
  ],
  output: {
    file: "lib/index.js",
    format: "es",
    sourcemap: false
  }
}