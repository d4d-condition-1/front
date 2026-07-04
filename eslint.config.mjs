import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── 프로젝트 구조 규약 강제 (docs/STRUCTURE.md) ──
  // 기능(feature) 경계와 계층 의존 방향을 어기면 CI lint에서 실패한다.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // 다른 기능의 내부 파일 직접 참조 금지 → barrel(@/features/<name>)만 허용
              group: ["@/features/*/*"],
              message:
                "다른 기능은 barrel로만 import 하세요: `@/features/<name>` (내부 경로 직접 참조 금지).",
            },
          ],
        },
      ],
    },
  },
  {
    // 공용 계층은 기능을 몰라야 한다: lib/components/types/constants → features 참조 금지
    files: [
      "src/lib/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/types/**/*.{ts,tsx}",
      "src/constants/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*"],
              message:
                "공용 계층(lib/components/types/constants)은 features를 import할 수 없습니다. 의존 방향은 features → 공용 계층 한 방향입니다.",
            },
          ],
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 배포 인프라(웹훅 서버 등)는 앱 소스가 아니므로 lint 제외
    "deploy/**",
  ]),
]);

export default eslintConfig;
