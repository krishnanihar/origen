import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
  },
  format: ["esm"],
  dts: {
    compilerOptions: {
      moduleResolution: "bundler",
    },
  },
  tsconfig: "tsconfig.lib.json",
  splitting: false,
  treeshake: true,
  clean: true,
  external: ["@modelcontextprotocol/sdk"],
});
