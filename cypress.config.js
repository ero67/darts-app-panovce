import { defineConfig } from 'cypress'
import { readFileSync, existsSync } from 'fs'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // Load environment variables from cypress.env.json if it exists
      if (existsSync('cypress.env.json')) {
        const envFile = JSON.parse(readFileSync('cypress.env.json', 'utf8'))
        // Merge with existing config.env
        config.env = { ...config.env, ...envFile }
      }
      
      return config
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})

