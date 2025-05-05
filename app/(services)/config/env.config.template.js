const ENV = {
  development: {
    API_URL: 'http://your-development-api-url:port',
  },
  production: {
    API_URL: 'https://your-production-api-url',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();

// Instructions:
// 1. Copy this file and rename it to env.config.js
// 2. Replace the API_URL values with your actual API endpoints
// 3. The env.config.js file will be ignored by Git to keep your endpoints secure 