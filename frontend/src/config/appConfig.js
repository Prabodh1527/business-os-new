// Runtime app configuration — things that could plausibly change without
// a rebuild (feature flags, defaults) as opposed to env.js, which holds
// build-time environment variables.

export const appConfig = {
  appName: 'Business OS',
  defaultIndustry: 'default', // falls back to INDUSTRY_LABELS.default in constants.js
  features: {
    aiInsights: true,
    whatsappIntegration: false, // future scope, per project doc
    multiCurrency: false,
  },
  pagination: {
    defaultPageSize: 10,
  },
  dateFormat: 'dd MMM yyyy',
  sidebarCollapsedByDefault: false,
};

export default appConfig;