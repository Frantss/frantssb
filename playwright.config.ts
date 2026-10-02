import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/client/features",
  testMatch: "**/*.pw.ts",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  updateSnapshots: "none",
  outputDir: "output/playwright/results",
  snapshotPathTemplate: "{testDir}/{testFileDir}/snapshots/{platform}/{projectName}/{arg}{ext}",
  reporter: [["list"], ["html", { outputFolder: "output/playwright/report", open: "never" }]],
  expect: { toHaveScreenshot: { animations: "disabled" } },
  use: {
    baseURL: "http://localhost:3333",
    browserName: "chromium",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    {
      name: "webkit-desktop",
      use: { browserName: "webkit", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "webkit-mobile",
      use: { browserName: "webkit", viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "vp dev --port 3333 --strictPort",
    url: "http://localhost:3333",
    reuseExistingServer: false,
    env: { APP_ENV: "test" },
  },
});
