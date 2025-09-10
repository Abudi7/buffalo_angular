module.exports = {
  ci: {
    collect: {
      // Static files directory
      staticDistDir: './www',
      // Number of runs to perform
      numberOfRuns: 3,
      // URLs to test (if you have a staging URL)
      url: process.env.STAGING_URL ? [process.env.STAGING_URL] : undefined,
    },
    assert: {
      // Performance budgets
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
      },
    },
    upload: {
      // Upload results to Lighthouse CI server (if configured)
      target: process.env.LHCI_SERVER_URL ? 'lhci' : 'temporary-public-storage',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
      token: process.env.LHCI_TOKEN,
    },
  },
};
