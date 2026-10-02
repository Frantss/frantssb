import type { CompilerOptions } from "@inlang/paraglide-js";

export default {
  project: "./project.inlang",
  outdir: "./src/paraglide",
  strategy: ["cookie", "baseLocale"],
  cookieName: "x-frantss-locale",
  emitTsDeclarations: true,
} satisfies CompilerOptions;
