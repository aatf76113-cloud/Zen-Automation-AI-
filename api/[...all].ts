import { app } from '../server/app';

export default function handler(req: any, res: any) {
  // If Vercel rewrote the path via [...all], reconstruct req.url so Express router matches it
  if (req.query && req.query.all) {
    const segments = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    req.url = `/api/${segments}`;
  } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/webhook')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
