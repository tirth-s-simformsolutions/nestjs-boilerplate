export const STATUS_MESSAGES = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'NonAuthoritativeInfo',
  204: 'NoContent',
  205: 'ResetContent',
  206: 'PartialContent',
};

export const IS_PUBLIC = 'isPublic';

export const SWAGGER_TAGS = {
  GENERAL: 'General',
  AUTH: 'Authentication',
  CHAT: 'Chat',
  USER: 'User',
};

export const ENV = {
  LOCAL: 'local',
  DEV: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

export const DEFAULT_MAX_LENGTH = 250;

export const DEFAULT_UUID_VERSION = 4;

export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 10;

export enum ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TIME_UNIT {
  DAY = 'd',
  WEEK = 'w',
  QUARTER = 'Q',
  MONTH = 'M',
  YEAR = 'y',
  HOUR = 'h',
  MINUTE = 'm',
  SECOND = 's',
  MILLISECOND = 'ms',
}
