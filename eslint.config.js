import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
const cleanGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([name, value]) => [name.trim(), value]),
);
export default [
  {
    ignores: [
      "dist",
      "artifacts",
      "test-results",
      "playwright-report",
      "r2-worker/node_modules",
      "r2-worker/.wrangler",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...cleanGlobals,
        ...globals.node,
        structuredClone: "readonly",
      },
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // Preserve deployed worker code; its behavior is covered by the isolated worker suite.
  {
    files: ["r2-worker/src/index.js"],
    rules: {
      "no-case-declarations": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^ctx$" }],
    },
  },
];
