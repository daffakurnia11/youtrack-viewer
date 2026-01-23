import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Console
      "no-console": ["error", { allow: ["warn", "error"] }],

      // Variables
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "off", // Use TypeScript version instead

      // Code quality
      "eqeqeq": ["error", "always"],
      "no-duplicate-imports": "error",
      "no-empty": "error",
      "no-return-await": "error",
      "object-shorthand": "error",

      // TypeScript (basic rules that work with Next.js config)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // React
      "react/self-closing-comp": "warn",

      // Imports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
]);

export default eslintConfig;
