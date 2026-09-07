import { parseDemoRequest, SubmissionError, type DemoRequest } from './demo.ts';

const MAX_BODY_BYTES = 32768;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function readForm(request: Request): Promise<FormData> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(contentType)) {
    throw new SubmissionError(415, 'unsupported_content_type');
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw new SubmissionError(413, 'request_too_large');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SubmissionError(400, 'invalid_fields');
  const buffer = new Uint8Array(MAX_BODY_BYTES);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new SubmissionError(413, 'request_too_large');
      }
      buffer.set(value, size - value.byteLength);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(buffer.slice(0, size), { headers: { 'Content-Type': contentType } }).formData();
  } catch {
    throw new SubmissionError(400, 'invalid_fields');
  }
}

export async function handleDemoRequest(
  request: Request,
  send: (data: DemoRequest) => Promise<string>,
): Promise<Response> {
  if (request.method !== 'POST') {
    const response = json({ ok: false, error: 'method_not_allowed' }, 405);
    response.headers.set('Allow', 'POST');
    return response;
  }
  // Browser submissions must originate on this deployment, including preview URLs.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return json({ ok: false, error: 'invalid_origin' }, 403);
  }
  try {
    const data = parseDemoRequest(await readForm(request));
    await send(data);
    return json({ ok: true, id: data.id }, 201);
  } catch (error) {
    if (error instanceof SubmissionError) {
      return json({ ok: false, error: error.code }, error.status);
    }
    // Do not log contact details, message bodies, or credentials.
    console.error('Demo request email could not be sent. Check email configuration and availability.');
    return json({ ok: false, error: 'email_unavailable' }, 503);
  }
}
