import { IGetResponse } from '.';
import { ITokenPayload } from './tokenPayload.interface';

export interface IDecodeTokenData {
  error: IGetResponse<unknown>;
  data: ITokenPayload;
}
