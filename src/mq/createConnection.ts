import amqp from 'amqp-connection-manager';
import { urlToOrigin } from '../helpers/urlToOrigin';
import config from '../config';
import logger from '../logger';

export const createConnection = () => {
  // configure connection
  const conn = amqp.connect(config.queue, {
    heartbeatIntervalInSeconds: 10,
  });

  // listen to connection events
  conn.on('connect', ({ url }) => {
    logger.info("amqp connected to '%s'!", urlToOrigin(url));
  });
  conn.on('connectFailed', ({ err, url }) => {
    logger.error("amqp connect '%s' failed!", urlToOrigin(url), err);
  });
  conn.on('blocked', ({ reason }) => {
    logger.info('amqp blocked %s!', reason);
  });
  conn.on('unblocked', () => {
    logger.info('amqp unblocked!');
  });
  conn.on('disconnect', ({ err }) => {
    logger.error('amqp disconnect!', err);
  });

  return conn;
};
