export class SubmissionError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  location: string;
  scope: string;
  timeline: string;
  lineDetails: string;
  locale: string;
}

export interface EmailConfig {
  apiKey: string;
  from: string;
  to: string;
}

export type FetchEmail = typeof fetch;

export function parseDemoRequest(form: FormData): DemoRequest {
  const field = (key: string, max: number, required = false, multiline = false) => {
    const entries = form.getAll(key);
    if (entries.length > 1 || (entries.length && typeof entries[0] !== 'string')) {
      throw new SubmissionError(400, 'invalid_fields');
    }
    const value = ((entries[0] as string | undefined) ?? '').trim();
    const controls = multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/;
    if (value.length > max || (required && !value) || controls.test(value)) {
      throw new SubmissionError(400, 'invalid_fields');
    }
    return value;
  };

  // This hidden field rejects basic form-filling bots without a third-party embed.
  if (field('website', 200)) throw new SubmissionError(400, 'invalid_fields');

  const data: DemoRequest = {
    id: field('request-id', 36, true),
    name: field('name', 120, true),
    email: field('email', 254, true),
    company: field('company', 200, true),
    location: field('location', 200),
    scope: field('scope', 20, true),
    timeline: field('timeline', 20, true),
    lineDetails: field('line-details', 5000, false, true),
    locale: field('locale', 2, true),
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    || !['inspection', 'amr-fleet', 'both', 'not-sure'].includes(data.scope)
    || !['this-quarter', 'next-6-months', 'exploring'].includes(data.timeline)
    || !['en', 'vi'].includes(data.locale)) {
    throw new SubmissionError(400, 'invalid_fields');
  }
  return data;
}

const scopeLabels: Record<string, string> = {
  inspection: 'Inspection',
  'amr-fleet': 'AMR fleet',
  both: 'Both',
  'not-sure': 'Not sure yet',
};

const timelineLabels: Record<string, string> = {
  'this-quarter': 'This quarter',
  'next-6-months': 'Next 6 months',
  exploring: 'Exploring',
};

export function formatDemoEmail(data: DemoRequest): string {
  return [
    'New MTRobotics website inquiry',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Site location: ${data.location || 'Not provided'}`,
    `Scope: ${scopeLabels[data.scope]}`,
    `Timeline: ${timelineLabels[data.timeline]}`,
    `Form language: ${data.locale === 'vi' ? 'Vietnamese' : 'English'}`,
    `Request ID: ${data.id}`,
    '',
    'Line details:',
    data.lineDetails || 'Not provided',
  ].join('\n');
}

export async function sendDemoEmail(
  data: DemoRequest,
  config: EmailConfig,
  fetchEmail: FetchEmail = fetch,
): Promise<string> {
  if (!config.apiKey || !config.from || !config.to) throw new Error('Email is not configured');

  const response = await fetchEmail('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `demo-request/${data.id}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: data.email,
      subject: `New demo request — ${data.company}`,
      text: formatDemoEmail(data),
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  const result = await response.json() as { id?: string };
  if (!result.id) throw new Error('Email provider did not return an ID');
  return result.id;
}
