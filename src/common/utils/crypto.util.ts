import * as bcrypt from 'bcryptjs';

export const hashPassword = async (
  password: string,
  salt: number,
): Promise<string> => bcrypt.hash(password, salt);

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => bcrypt.compare(password, hashedPassword);
