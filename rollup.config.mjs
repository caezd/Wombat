import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/wombat.js",
  output: {
    file: "dist/wombat.min.js",
    format: "iife",
    name: "Wombat",
  },
  plugins: [resolve(), commonjs(), terser()],
};
