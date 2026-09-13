import { app } from '../server/app';

export default function handler(req: any, res: any) {
  // Normalize req.url so Express router matches regardless of Vercel path rewriting
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/webhook')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
