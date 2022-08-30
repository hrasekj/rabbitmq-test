import { URL } from 'node:url';
import amqp from 'amqp-connection-manager';
import { Options } from 'amqplib';

import config from '../config';
import logger from '../logger';

const urlToOrigin = (url: string | Options.Connect) => {
  if (typeof url === 'string') {
    const { protocol, hostname, port, pathname } = new URL(url);
    return `${protocol}//${hostname}:${port || 5672}${pathname || '/'}`;
  }

  const { protocol, hostname, port, vhost } = url;
  return `${protocol}://${hostname}:${port}${vhost}`;
};

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
