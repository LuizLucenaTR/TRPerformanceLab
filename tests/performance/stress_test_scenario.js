import http from 'k6/http';
import { check } from 'k6';
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

// Calculate stress test parameters (aggressive scaling beyond normal load)
const STRESS_MULTIPLIER = 3; // Scale up to 3x the specified VUs for stress testing
const MAX_STRESS_VUS = V_USERS * STRESS_MULTIPLIER;

// Configure k6 options for aggressive stress testing with multiple stages
export const options = {
  stages: [
    { duration: RAMP_UP_TIME, target: V_USERS }, // Normal load
    { duration: '2m', target: Math.floor(MAX_STRESS_VUS * 0.5) }, // 50% of stress load
    { duration: '3m', target: Math.floor(MAX_STRESS_VUS * 0.75) }, // 75% of stress load
    { duration: TEST_DURATION, target: MAX_STRESS_VUS }, // Full stress load
    { duration: '2m', target: Math.floor(MAX_STRESS_VUS * 0.5) }, // Scale down to 50%
    { duration: '1m', target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // More lenient for stress testing - 95% under 5s
    http_req_failed: ['rate<0.3'], // Higher error tolerance - 30% for stress testing
    errors: ['rate<0.3'], // Custom error rate tolerance
  },
};

// If RPS_RATE is specified, use aggressive constant arrival rate
if (RPS_RATE) {
  const STRESS_RPS = RPS_RATE * STRESS_MULTIPLIER;
  options.scenarios = {
    stress_constant_rate: {
      executor: 'constant-arrival-rate',
      rate: STRESS_RPS,
      timeUnit: '1s',
      duration: TEST_DURATION,
      preAllocatedVUs: Math.min(MAX_STRESS_VUS, 100),
      maxVUs: MAX_STRESS_VUS,
    },
  };
  delete options.stages; // Remove stages when using arrival rate
}

// Helper function to get authentication headers
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-stress-test/1.0',
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

// Main stress test function - aggressive with no sleep
export default function () {
  const headers = getAuthHeaders();
  
  // Primary stress endpoint - data endpoint for more intensive operations
  const dataResponse = http.get(`${TARGET_ENDPOINT}/data`, { headers });
  
  // Check response status with more lenient criteria for stress testing
  const dataCheckPassed = check(dataResponse, {
    'Data endpoint responded': (r) => r.status >= 200 && r.status < 500,
    'Data endpoint response time < 10s': (r) => r.timings.duration < 10000,
    'Data endpoint not timing out': (r) => r.status !== 0,
  });

  if (!dataCheckPassed) {
    errorRate.add(1);
  }

  // Additional concurrent requests to stress the system further
  const batchRequests = [
    ['GET', `${TARGET_ENDPOINT}/health`, null, { headers }],
    ['GET', `${TARGET_ENDPOINT}/status`, null, { headers }],
  ];

  const responses = http.batch(batchRequests);
  
  // Check batch responses
  responses.forEach((response, index) => {
    const batchCheckPassed = check(response, {
      [`Batch request ${index + 1} responded`]: (r) => r.status >= 200 && r.status < 500,
      [`Batch request ${index + 1} not timing out`]: (r) => r.status !== 0,
    });

    if (!batchCheckPassed) {
      errorRate.add(1);
    }
  });

  // POST request to stress write operations (if endpoint supports it)
  const postData = JSON.stringify({
    stress_test: true,
    timestamp: new Date().toISOString(),
    vu: __VU,
    iteration: __ITER,
  });

  const postResponse = http.post(`${TARGET_ENDPOINT}/test-data`, postData, { headers });
  
  check(postResponse, {
    'POST request handled': (r) => r.status >= 200 && r.status < 500 || r.status === 404 || r.status === 405,
    'POST request not timing out': (r) => r.status !== 0,
  });

  // NO SLEEP - This is stress testing, we want to hit the system as hard as possible

  // Log important metrics for debugging (less frequently in stress testing)
  if (__VU === 1 && __ITER % 100 === 0) {
    console.log(`Stress Test Progress - VU: ${__VU}, Iteration: ${__ITER}`);
  }
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting Stress Test...');
  console.log(`Testing endpoint: ${TARGET_ENDPOINT}`);
  console.log(`Base VUsers: ${V_USERS}, Max Stress VUsers: ${MAX_STRESS_VUS}`);
  console.log(`Stress Multiplier: ${STRESS_MULTIPLIER}x`);
  
  // Verify the target endpoint is accessible before starting stress test
  const testResponse = http.get(`${TARGET_ENDPOINT}/health`);
  if (testResponse.status === 0) {
    throw new Error(`Cannot reach target endpoint: ${TARGET_ENDPOINT}`);
  }
  
  return {
    startTime: new Date().toISOString(),
    targetEndpoint: TARGET_ENDPOINT,
  };
}

// Teardown function (runs once after all iterations)
export function teardown(data) {
  console.log('Stress Test completed.');
  console.log(`Started at: ${data.startTime}`);
  console.log(`Ended at: ${new Date().toISOString()}`);
  console.log(`Target was: ${data.targetEndpoint}`);
}
