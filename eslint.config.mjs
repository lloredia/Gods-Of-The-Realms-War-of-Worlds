import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Client pages load localStorage after mount so the server HTML matches.
      // That setState is the hydration boundary, not a derived-state effect.
      'react-hooks/set-state-in-effect': 'off',
      // Existing useMemo dependency lists are intentional and behavior-preserving.
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'public/**',
    'docs/**',
  ]),
]);

export default eslintConfig;
