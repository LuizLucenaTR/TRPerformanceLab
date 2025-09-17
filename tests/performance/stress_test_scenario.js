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
  const vuId = __VU;
  const iterId = __ITER;
  
  // Primary stress endpoint - data endpoint for more intensive operations
  const dataResponse = http.get(`${TARGET_ENDPOINT}/data`, { headers });
  
  // Log detailed request information for stress test
  console.log(`[VU:${vuId}|IT:${iterId}] STRESS Data: ${dataResponse.status} | ${Math.round(dataResponse.timings.duration)}ms | ${TARGET_ENDPOINT}/data`);
  
  // Check response status with more lenient criteria for stress testing
  const dataCheckPassed = check(dataResponse, {
    'Data endpoint responded': (r) => {
      const passed = r.status >= 200 && r.status < 500;
      if (!passed) {
        console.error(`[VU:${vuId}|IT:${iterId}] ❌ STRESS Data endpoint failed: ${r.status} | Body: ${r.body ? r.body.substring(0, 100) : 'No body'}`);
      }
      return passed;
    },
    'Data endpoint response time < 10s': (r) => {
      const passed = r.timings.duration < 10000;
      if (!passed) {
        console.warn(`[VU:${vuId}|IT:${iterId}] ⚠️  STRESS Data endpoint very slow: ${Math.round(r.timings.duration)}ms (threshold: 10000ms)`);
      }
      return passed;
    },
    'Data endpoint not timing out': (r) => {
      const passed = r.status !== 0;
      if (!passed) {
        console.error(`[VU:${vuId}|IT:${iterId}] 💥 STRESS Data endpoint TIMEOUT or CONNECTION ERROR`);
      }
      return passed;
    },
  });

  if (!dataCheckPassed) {
    errorRate.add(1);
    console.error(`[VU:${vuId}|IT:${iterId}] 🚨 STRESS Data endpoint FAILED - incrementing error rate`);
  }

  // Additional concurrent requests to stress the system further
  const batchRequests = [
    ['GET', `${TARGET_ENDPOINT}/health`, null, { headers }],
    ['GET', `${TARGET_ENDPOINT}/status`, null, { headers }],
  ];

  const responses = http.batch(batchRequests);
  
  // Check batch responses with detailed logging
  responses.forEach((response, index) => {
    const endpoint = index === 0 ? 'health' : 'status';
    console.log(`[VU:${vuId}|IT:${iterId}] STRESS Batch[${index + 1}]-${endpoint}: ${response.status} | ${Math.round(response.timings.duration)}ms`);
    
    const batchCheckPassed = check(response, {
      [`Batch request ${index + 1} responded`]: (r) => {
        const passed = r.status >= 200 && r.status < 500;
        if (!passed) {
          console.error(`[VU:${vuId}|IT:${iterId}] ❌ STRESS Batch[${index + 1}]-${endpoint} failed: ${r.status}`);
        }
        return passed;
      },
      [`Batch request ${index + 1} not timing out`]: (r) => {
        const passed = r.status !== 0;
        if (!passed) {
          console.error(`[VU:${vuId}|IT:${iterId}] 💥 STRESS Batch[${index + 1}]-${endpoint} TIMEOUT`);
        }
        return passed;
      },
    });

    if (!batchCheckPassed) {
      errorRate.add(1);
      console.error(`[VU:${vuId}|IT:${iterId}] 🚨 STRESS Batch[${index + 1}]-${endpoint} FAILED - incrementing error rate`);
    }
  });

  // POST request to stress write operations (if endpoint supports it)
  const postData = JSON.stringify({
    stress_test: true,
    timestamp: new Date().toISOString(),
    vu: vuId,
    iteration: iterId,
  });

  const postResponse = http.post(`${TARGET_ENDPOINT}/test-data`, postData, { headers });
  
  console.log(`[VU:${vuId}|IT:${iterId}] STRESS POST: ${postResponse.status} | ${Math.round(postResponse.timings.duration)}ms | ${TARGET_ENDPOINT}/test-data`);
  
  const postCheckPassed = check(postResponse, {
    'POST request handled': (r) => {
      const passed = (r.status >= 200 && r.status < 500) || r.status === 404 || r.status === 405;
      if (!passed && r.status !== 404 && r.status !== 405) {
        console.error(`[VU:${vuId}|IT:${iterId}] ❌ STRESS POST failed: ${r.status} | Body: ${r.body ? r.body.substring(0, 100) : 'No body'}`);
      }
      return passed;
    },
    'POST request not timing out': (r) => {
      const passed = r.status !== 0;
      if (!passed) {
        console.error(`[VU:${vuId}|IT:${iterId}] 💥 STRESS POST TIMEOUT`);
      }
      return passed;
    },
  });

  if (!postCheckPassed) {
    errorRate.add(1);
  }

  // NO SLEEP - This is stress testing, we want to hit the system as hard as possible

  // Log stress test progress more frequently for monitoring
  if (vuId === 1 && iterId % 50 === 0) {
    console.log(`[VU:${vuId}|IT:${iterId}] 🔥 STRESS Progress - Data: ${dataResponse.status}(${Math.round(dataResponse.timings.duration)}ms), Batch: [${responses[0].status},${responses[1].status}], POST: ${postResponse.status}`);
  }

  // Log configuration on first iteration
  if (vuId === 1 && iterId === 1) {
    console.log(`🔥 Stress Test Configuration (${STRESS_MULTIPLIER}x multiplier):`);
    console.log(`   Target: ${TARGET_ENDPOINT}`);
    console.log(`   Base VUsers: ${V_USERS} → Max Stress VUsers: ${MAX_STRESS_VUS}`);
    console.log(`   Duration: ${TEST_DURATION}`);
    console.log(`   Ramp Up: ${RAMP_UP_TIME}`);
    console.log(`   RPS Rate: ${RPS_RATE ? `${RPS_RATE} → ${RPS_RATE * STRESS_MULTIPLIER}` : 'Not specified'}`);
    console.log(`   Auth Type: ${AUTH_TYPE}`);
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
