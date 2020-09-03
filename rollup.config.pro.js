import typescript from "@rollup/plugin-typescript";
export default {
  input: `${__dirname}/src/index.ts`,
  output: {
    file: `${__dirname}/lib/index.js`,
    format: "umd",
    name: "duraStat",
    sourcemap: true,
  },
  plugins: [typescript()],
};
