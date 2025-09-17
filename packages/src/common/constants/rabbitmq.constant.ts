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
  BOOK_CREATED: 'book-created-rabbitmq',
  USER_ACTIVATED: 'user-activated-rabbitmq',
};
