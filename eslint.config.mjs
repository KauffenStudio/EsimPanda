import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // INF-11: the three v1.1-deleted mock-data modules must never be re-imported.
    // The four KEPT mock-data files (checkout/coupons/dashboard/delivery) stay importable.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/mock-data/destinations",
                "@/lib/mock-data/plans",
                "@/lib/mock-data/tag-plans",
                "**/mock-data/destinations",
                "**/mock-data/plans",
                "**/mock-data/tag-plans",
              ],
              message:
                "mock-data/{destinations,plans,tag-plans} were deleted in v1.1 (INF-11). Use @/lib/db/destinations for catalog data and @/lib/plans/pricing-display for pure pricing helpers.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
