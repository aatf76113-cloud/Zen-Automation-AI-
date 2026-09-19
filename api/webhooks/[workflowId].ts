import { app } from '../../server/app';

export default function handler(req: any, res: any) {
  const workflowId = req.query?.workflowId || req.params?.workflowId || 'wf_01';
  req.url = `/api/webhooks/${workflowId}`;
  return app(req, res);
}
