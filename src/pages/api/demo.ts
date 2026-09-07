import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { sendDemoEmail } from '../../server/demo.ts';
import { handleDemoRequest } from '../../server/demo-handler.ts';

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleDemoRequest(request, (data) => sendDemoEmail(data, {
  apiKey: getSecret('RESEND_API_KEY') ?? '',
  from: getSecret('CONTACT_FROM_EMAIL') ?? '',
  to: getSecret('CONTACT_TO_EMAIL') ?? 'mtrobotix@gmail.com',
}));
