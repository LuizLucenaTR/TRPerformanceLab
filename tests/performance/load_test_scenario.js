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
  const vuId = __VU;
  const iterId = __ITER;
  
  // Main endpoint test - using exact URL provided
  const mainResponse = http.get(TARGET_ENDPOINT, { headers });
  
  // Log detailed request information
  console.log(`[VU:${vuId}|IT:${iterId}] Main Request: ${mainResponse.status} | ${Math.round(mainResponse.timings.duration)}ms | ${TARGET_ENDPOINT}`);
  
  // Check response status with detailed error logging
  const mainCheckPassed = check(mainResponse, {
    'Main endpoint status is 200': (r) => {
      const passed = r.status === 200;
      if (!passed) {
        console.error(`[VU:${vuId}|IT:${iterId}] ❌ Main endpoint failed: Expected 200, got ${r.status} | Body: ${r.body ? r.body.substring(0, 100) : 'No body'}`);
      }
      return passed;
    },
    'Main endpoint response time < 2000ms': (r) => {
      const passed = r.timings.duration < 2000;
      if (!passed) {
        console.warn(`[VU:${vuId}|IT:${iterId}] ⚠️  Main endpoint slow: ${Math.round(r.timings.duration)}ms (threshold: 2000ms)`);
      }
      return passed;
    },
    'Main endpoint has response': (r) => {
      const passed = r.body && r.body.length > 0;
      if (!passed) {
        console.error(`[VU:${vuId}|IT:${iterId}] ❌ Main endpoint empty response: ${r.status}`);
      }
      return passed;
    },
  });

  if (!mainCheckPassed) {
    errorRate.add(1);
    console.error(`[VU:${vuId}|IT:${iterId}] 🚨 Main endpoint FAILED - incrementing error rate`);
  }

  // Simulate user think time (typical for load testing)
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds

  // Log periodic summaries (every 10th iteration for VU 1)
  if (vuId === 1 && iterId % 10 === 0) {
    console.log(`[VU:${vuId}|IT:${iterId}] 📊 Periodic Summary - Main: ${mainResponse.status} (${Math.round(mainResponse.timings.duration)}ms)`);
  }

  // Log important metrics for debugging (first iteration only)
  if (vuId === 1 && iterId === 1) {
    console.log(`🚀 Load Test Configuration:`);
    console.log(`   Target: ${TARGET_ENDPOINT}`);
    console.log(`   VUsers: ${V_USERS}`);
    console.log(`   Duration: ${TEST_DURATION}`);
    console.log(`   Ramp Up: ${RAMP_UP_TIME}`);
    console.log(`   RPS Rate: ${RPS_RATE || 'Not specified'}`);
    console.log(`   Auth Type: ${AUTH_TYPE}`);
    console.log(`   Headers: ${JSON.stringify(headers, null, 2)}`);
  }
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting Load Test...');
  console.log(`Testing endpoint: ${TARGET_ENDPOINT}`);
  
  // DEBUG: Print all environment variables being used by k6
  console.log('📝 K6 SCRIPT - VARIÁVEIS DE AMBIENTE RECEBIDAS:');
  console.log(`  - TARGET_ENDPOINT: "${TARGET_ENDPOINT}"`);
  console.log(`  - V_USERS: "${V_USERS}"`);
  console.log(`  - TEST_DURATION: "${TEST_DURATION}"`);
  console.log(`  - RAMP_UP_TIME: "${RAMP_UP_TIME}"`);
  console.log(`  - RPS_RATE: "${RPS_RATE}"`);
  console.log(`  - AUTH_TYPE: "${AUTH_TYPE}"`);
  console.log(`  - BASIC_AUTH_USER: "${BASIC_AUTH_USER}"`);
  console.log(`  - BASIC_AUTH_PASS: "${BASIC_AUTH_PASS ? '*'.repeat(BASIC_AUTH_PASS.length) : ''}"`);
  console.log(`  - BEARER_TOKEN: "${BEARER_TOKEN ? '*'.repeat(Math.min(BEARER_TOKEN.length, 10)) + '...' : ''}"`);
  console.log('========================================');
  
  return {};
}

// Teardown function (runs once after all iterations)
export function teardown(data) {
  console.log('Load Test completed.');
}
