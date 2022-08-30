import { ConnectionUrl } from 'amqp-connection-manager';

export default {
  queue: ['amqp://admin:admin@queue'] as ConnectionUrl[],
};
