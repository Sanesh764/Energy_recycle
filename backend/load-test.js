
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1100,
  duration: "60s",
};

export default function () {
  const response = http.get(
    "http://ewaste-api-production.eba-yyz2i32r.ap-southeast-1.elasticbeanstalk.com/health"
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
