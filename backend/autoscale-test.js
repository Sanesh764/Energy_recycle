import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 200 },
    { duration: '60s', target: 400 },
    { duration: '60s', target: 600 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const res = http.get('http://localhost:8080/health');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.2);
}
