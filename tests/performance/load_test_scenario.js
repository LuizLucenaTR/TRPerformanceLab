import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import encoding from 'k6/encoding';

// Custom metrics
export const errorRate = new Rate('errors');

// Read parameters from environment variables
const TARGET_ENDPOINT = __ENV.TARGET_ENDPOINT || 'https://httpbin.org';
const V_USERS = parseInt(__ENV.V_USERS) || 10;
const TEST_DURATION = __ENV.TEST_DURATION || '5m';
const RAMP_UP_TIME = __ENV.RAMP_UP_TIME || '1m';
const RPS_RATE = parseInt(__ENV.RPS_RATE) || null;
const AUTH_TYPE = __ENV.AUTH_TYPE || 'none';
const BASIC_AUTH_USER = __ENV.BASIC_AUTH_USER || '';
const BASIC_AUTH_PASS = __ENV.BASIC_AUTH_PASS || '';
const BEARER_TOKEN = __ENV.BEARER_TOKEN || '';

// Configure k6 options based on parameters
export const options = {
  stages: [
    { duration: RAMP_UP_TIME, target: V_USERS }, // Ramp up to target VUs
    { duration: TEST_DURATION, target: V_USERS }, // Maintain load
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'], // Error rate should be less than 10%
    errors: ['rate<0.1'], // Custom error rate should be less than 10%
  },
};

// If RPS_RATE is specified, use constant arrival rate instead of stages
if (RPS_RATE) {
  options.scenarios = {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: RPS_RATE,
      timeUnit: '1s',
      duration: TEST_DURATION,
      preAllocatedVUs: Math.min(V_USERS, 50),
      maxVUs: V_USERS,
    },
  };
  delete options.stages; // Remove stages when using arrival rate
}

// Helper function to get authentication headers
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-load-test/1.0',
  };

  switch (AUTH_TYPE) {
    case 'basic_auth':
      if (BASIC_AUTH_USER && BASIC_AUTH_PASS) {
        const credentials = encoding.b64encode(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASS}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;
    case 'bearer_token':
      if (BEARER_TOKEN) {
        headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
      }
      break;
    default:
      // No authentication
      break;
  }

  return headers;
}

// Main test function
export default function () {
  const headers = getAuthHeaders();
  
  // Health check endpoint - typical load test scenario
  const healthResponse = http.get(`${TARGET_ENDPOINT}/health`, { headers });
  
  // Check response status
  const healthCheckPassed = check(healthResponse, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 500ms': (r) => r.timings.duration < 500,
    'Health check has valid response': (r) => r.body.length > 0,
  });

  if (!healthCheckPassed) {
    errorRate.add(1);
  }

  // Simulate user think time (typical for load testing)
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds

  // Additional API endpoint test (simulate typical user workflow)
  const dataResponse = http.get(`${TARGET_ENDPOINT}/data`, { headers });
  
  const dataCheckPassed = check(dataResponse, {
    'Data endpoint status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'Data endpoint response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  if (!dataCheckPassed && dataResponse.status !== 404) {
    errorRate.add(1);
  }

  // Log important metrics for debugging
  if (__VU === 1 && __ITER === 1) {
    console.log(`Load Test Configuration:`);
    console.log(`Target: ${TARGET_ENDPOINT}`);
    console.log(`VUsers: ${V_USERS}`);
    console.log(`Duration: ${TEST_DURATION}`);
    console.log(`Ramp Up: ${RAMP_UP_TIME}`);
    console.log(`RPS Rate: ${RPS_RATE || 'Not specified'}`);
    console.log(`Auth Type: ${AUTH_TYPE}`);
  }
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting Load Test...');
  console.log(`Testing endpoint: ${TARGET_ENDPOINT}`);
  return {};
}

// Teardown function (runs once after all iterations)
export function teardown(data) {
  console.log('Load Test completed.');
}
