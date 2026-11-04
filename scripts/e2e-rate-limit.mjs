/**
 * Verifies the authentication rate limit against a dedicated API instance so the
 * main development server's budget is not consumed.
 */
import { spawn } from 'node:child_process';

const PORT = 4100;
const BASE = `http://127.0.0.1:${PORT}/api/v1`;
const LOGINS = 6;

const child = spawn(process.execPath, ['dist/main.js'], {
  cwd: new URL('../apps/api/', import.meta.url),
  env: { ...process.env, PORT: String(PORT), AUTH_RATE_LIMIT: '5' },
  stdio: 'ignore',
});

let pass = 0;
let fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`PASS  ${name}`); } else { fail++; console.log(`FAIL  ${name} ${detail}`); }
}

async function waitForHealth() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

try {
  const ready = await waitForHealth();
  check('rate-limit instance started', ready);
  if (!ready) throw new Error('instance did not start');

  const statuses = [];
  let limited = null;
  for (let i = 0; i < LOGINS; i++) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'Password123!' }),
    });
    statuses.push(res.status);
    if (res.status === 429) limited = res;
  }

  check('first requests are not blocked', statuses.slice(0, 4).every((s) => s !== 429), JSON.stringify(statuses));
  check('requests beyond the limit are rejected with 429', statuses.includes(429), JSON.stringify(statuses));
  check('429 response advertises a retry-after policy', limited?.headers.get('retry-after') !== null, String(limited?.headers.get('retry-after')));
} finally {
  child.kill();
  // Give the OS a moment to release the child handle before exiting; Node on Windows
  // asserts if a handle is still closing when the process terminates.
  await new Promise((resolve) => setTimeout(resolve, 300));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail === 0 ? 0 : 1;
