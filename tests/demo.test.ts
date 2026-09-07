import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDemoEmail, parseDemoRequest, sendDemoEmail, SubmissionError, type DemoRequest } from '../src/server/demo.ts';
import { handleDemoRequest } from '../src/server/demo-handler.ts';

const data: DemoRequest = {
  id: 'bc240fc2-94cb-45f0-a188-0e095e855467',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  location: 'Toronto, Canada',
  scope: 'inspection',
  timeline: 'this-quarter',
  lineDetails: 'Inspect machined parts at the end of the line.',
  locale: 'en',
};

function validForm() {
  const form = new FormData();
  form.set('request-id', data.id);
  form.set('name', data.name);
  form.set('email', data.email);
  form.set('company', data.company);
  form.set('location', data.location);
  form.set('scope', data.scope);
  form.set('timeline', data.timeline);
  form.set('line-details', data.lineDetails);
  form.set('locale', data.locale);
  form.set('website', '');
  return form;
}

test('parses a valid request and formats every submitted field', () => {
  const parsed = parseDemoRequest(validForm());
  assert.deepEqual(parsed, data);
  const report = formatDemoEmail(parsed);
  for (const value of [data.name, data.email, data.company, data.location, data.lineDetails, data.id]) {
    assert.match(report, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('rejects invalid values and the honeypot field', () => {
  const invalid = validForm();
  invalid.set('scope', 'made-up');
  assert.throws(() => parseDemoRequest(invalid), SubmissionError);

  const bot = validForm();
  bot.set('website', 'https://spam.invalid');
  assert.throws(() => parseDemoRequest(bot), SubmissionError);
});

test('sends the report with reply-to and an idempotency key', async () => {
  let sentUrl = '';
  let sentInit: RequestInit | undefined;
  const fakeFetch: typeof fetch = async (input, init) => {
    sentUrl = String(input);
    sentInit = init;
    return Response.json({ id: 'email_123' }, { status: 200 });
  };

  const id = await sendDemoEmail(data, {
    apiKey: 're_test',
    from: 'MTRobotics <website@example.com>',
    to: 'mtrobotix@gmail.com',
  }, fakeFetch);

  assert.equal(id, 'email_123');
  assert.equal(sentUrl, 'https://api.resend.com/emails');
  const headers = new Headers(sentInit?.headers);
  assert.equal(headers.get('Idempotency-Key'), `demo-request/${data.id}`);
  const body = JSON.parse(String(sentInit?.body));
  assert.equal(body.reply_to, data.email);
  assert.deepEqual(body.to, ['mtrobotix@gmail.com']);
  assert.match(body.text, /Inspect machined parts/);
});

test('accepts a valid same-origin form only after email delivery', async () => {
  const request = new Request('https://mtr.example/api/demo', {
    method: 'POST',
    headers: { Origin: 'https://mtr.example' },
    body: validForm(),
  });
  let delivered = false;
  const response = await handleDemoRequest(request, async () => {
    delivered = true;
    return 'email_123';
  });

  assert.equal(response.status, 201);
  assert.equal(delivered, true);
  assert.deepEqual(await response.json(), { ok: true, id: data.id });
});

test('rejects cross-origin submissions and reports delivery failures', async () => {
  const crossOrigin = new Request('https://mtr.example/api/demo', {
    method: 'POST',
    headers: { Origin: 'https://spam.invalid' },
    body: validForm(),
  });
  assert.equal((await handleDemoRequest(crossOrigin, async () => 'unused')).status, 403);

  const providerFailure = new Request('https://mtr.example/api/demo', {
    method: 'POST',
    headers: { Origin: 'https://mtr.example' },
    body: validForm(),
  });
  const response = await handleDemoRequest(providerFailure, async () => {
    throw new Error('provider unavailable');
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: 'email_unavailable' });
});
