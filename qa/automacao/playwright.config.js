const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    // Usa o Chrome instalado na máquina; remova a linha para usar o Chromium do Playwright
    channel: 'chrome',
  },
  webServer: {
    command: 'node servidor.js',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: true,
  },
});
