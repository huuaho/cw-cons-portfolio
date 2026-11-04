import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", ".wrangler/**", "next-env.d.ts"]),
  {
    rules: {
      // Static export: no image optimisation server, and uploads have unknown sizes.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
