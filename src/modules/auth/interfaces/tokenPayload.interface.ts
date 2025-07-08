import { TOKEN_TYPE } from '../auth.constant';

export interface ITokenPayload {
  userId: string;
  tokenType: TOKEN_TYPE;
}
