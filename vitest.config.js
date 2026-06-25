import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const viewportSize = { width: 700,  height: 400 };

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        launchOptions: {
          ignoreDefaultArgs: ['--hide-scrollbars'],
        }
      }),
      instances: [
        {
          browser: 'chromium',
          viewport: viewportSize,
        },
      ],
    },
  },
});
