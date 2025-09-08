import { IGetResponse } from '@packages/common';
import { ITokenPayload } from './tokenPayload.interface';
export interface IDecodeTokenData {
  error: IGetResponse<unknown>;
  data: ITokenPayload;
}
