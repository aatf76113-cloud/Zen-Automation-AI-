import { app } from '../server/app';

export default function handler(req: any, res: any) {
  // Ensure req.url matches /webhook for Meta Webhook verification & WhatsApp events
  if (req.url && !req.url.startsWith('/webhook') && !req.url.startsWith('/api/webhook')) {
    req.url = '/webhook' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
