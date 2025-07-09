export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&_])[A-Za-z\d@#$!%*?&_].{7,}$/;

export const USERNAME_REGEX = /^[a-z0-9_]{4,12}$/;

export const PASSWORD_DEFAULT_MIN_LENGTH = 8;
