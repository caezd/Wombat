import terser from "@rollup/plugin-terser";

export default {
  input: "src/wombat.js",
  output: {
    file: "wombat.min.js",
    format: "iife",
    name: "version",
    plugins: [terser()],
  },
};
