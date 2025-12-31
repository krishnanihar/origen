import { defineConfig } from "tsup";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    button: "src/components/button/index.ts",
    input: "src/components/input/index.ts",
    card: "src/components/card/index.ts",
    select: "src/components/select/index.ts",
    modal: "src/components/modal/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  treeshake: true,
  clean: true,
  external: ["react", "react-dom"],
  async onSuccess() {
    // Add "use client" directive to all JS/CJS files
    const distDir = "./dist";
    const files = readdirSync(distDir).filter(
      (f) => f.endsWith(".js") || f.endsWith(".cjs")
    );

    for (const file of files) {
      const filePath = join(distDir, file);
      const content = readFileSync(filePath, "utf-8");
      if (!content.startsWith('"use client"')) {
        writeFileSync(filePath, `"use client";\n${content}`);
      }
    }
    console.log("Added 'use client' directive to output files");
  },
});
