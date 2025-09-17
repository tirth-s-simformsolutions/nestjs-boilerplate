export const RABBITMQ_EXCHANGE_TYPES = {
  DIRECT: 'direct',
  FANOUT: 'fanout',
  TOPIC: 'topic',
  HEADERS: 'headers',
};

export const RABBITMQ_COMMON_OPTIONS = {
  queueOptions: {
    durable: true,
  },
  prefetchCount: 10,
  noAck: false,
};

export const RABBITMQ_SERVICES = {
  AUTH_SERVICE: 'auth_service',
  BOOK_SERVICE: 'book_service',
};

export const RABBITMQ_EVENTS = {
  USER_ACTIVATED: 'user-activated',
  CREATE_BOOK: 'create-book',
};
