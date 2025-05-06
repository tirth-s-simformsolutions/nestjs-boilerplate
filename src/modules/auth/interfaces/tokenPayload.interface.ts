import { TOKEN_TYPE } from '../../../common/constants';

export interface ITokenPayload {
  userId: string;
  tokenType: TOKEN_TYPE;
}
