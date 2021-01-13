import {verify} from 'noble-ed25519';
import {Request, Response, NextFunction} from 'express';
import {Interaction} from './Interaction';
import {IncomingHttpHeaders} from 'http';

//TODO: support more servers
export function validateInteraction(publicKey: string, server = 'express') {
  switch (server) {
    case 'express':
    default: {
      return async function (req: Request, res: Response, next: NextFunction) {
        if (req.method !== 'POST') {
          return res.sendStatus(405);
        }

        const isSigned = await validateRequest(
          publicKey,
          req.body,
          req.headers
        );

        if (!isSigned) {
          return res.sendStatus(401);
        }

        if (req.body.type === 1) {
          return res.json({type: 1});
        }

        next();
        return;
      };
    }
  }
}

export async function validateRequest(
  publicKey: string,
  body: Interaction,
  headers:
    | ({
        'x-signature-ed25519': string;
        'x-signature-timestamp': string;
      } & Record<string | number, unknown>)
    | IncomingHttpHeaders
): Promise<boolean> {
  const signature = headers['x-signature-ed25519'];
  const timestamp = headers['x-signature-timestamp'];

  if (!signature || !timestamp) {
    return false;
  }

  const hash = Buffer.concat([
    Buffer.from(timestamp as string, 'utf-8'),
    Buffer.from(JSON.stringify(body)),
  ]);

  const isSigned = await verify(signature as string, hash, publicKey);

  if (!isSigned) {
    return false;
  }

  return true;
}
