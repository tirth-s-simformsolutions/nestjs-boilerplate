import { sign, verify, VerifyErrors } from 'jsonwebtoken';
import type { StringValue } from 'ms';

export const generateJwtToken = (
  payload: string | Buffer | object,
  secretKey: string,
  expiresIn?: StringValue | number,
) => sign(payload, secretKey, expiresIn ? { expiresIn } : null);

export const verifyToken = <T>(
  token: string,
  secretKey: string,
): Promise<{ error: VerifyErrors; data: T }> =>
  new Promise((resolve) => {
    verify(token, secretKey, (error, verifiedJwt) => {
      if (error) {
        return resolve({ error, data: null });
      }
      return resolve({ error: null, data: verifiedJwt as T });
    });
  });
