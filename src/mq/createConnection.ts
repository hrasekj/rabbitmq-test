import amqp, { AmqpConnectionManager } from 'amqp-connection-manager';
import { nanoid } from 'nanoid';
import { urlToOrigin } from '../helpers/urlToOrigin';
import config from '../config';
import logger from '../logger';

const connRegistry = new Map<string, string[]>();
const connPool = new Map<string, AmqpConnectionManager>();
const maxChannelCountPerConnection = 9;

export const createConnection = (type: string): AmqpConnectionManager => {
  const registry = connRegistry.get(type) || [];

  for (let i = 0; i < registry.length; i++) {
    const connId = registry[i];
    const conn = connPool.get(connId);

    // limit number of channels per connection
    if (conn && conn.channelCount < maxChannelCountPerConnection) {
      return conn;
    }
  }

  // create/register new connection
  const newIndex = nanoid(8);
  const newConn = newConnection(newIndex, type);

  connPool.set(newIndex, newConn);
  connRegistry.set(type, registry.concat(newIndex));

  return newConn;
};

const newConnection = (connId: string, type: string) => {
  // configure connection
  const conn = amqp.connect(config.queue, {
    heartbeatIntervalInSeconds: 10,
  });

  // cleanup on disconnect
  conn.once('disconnect', () => {
    const registry = connRegistry.get(type) || [];
    connRegistry.set(
      type,
      registry.filter((val) => val === connId)
    );
    connPool.delete(connId);
  });

  // log connection events
  conn.on('connect', ({ url }) => {
    logger.info("amqp(%s) connected to '%s'!", connId, urlToOrigin(url));
  });
  conn.on('connectFailed', ({ err, url }) => {
    logger.error("amqp(%s) connect '%s' failed!", connId, url && urlToOrigin(url), err);
  });
  conn.on('blocked', ({ reason }) => {
    logger.info('amqp(%s) blocked %s!', connId, reason);
  });
  conn.on('unblocked', () => {
    logger.info('amqp(%s) unblocked!', connId);
  });
  conn.on('disconnect', ({ err }) => {
    logger.error('amqp(%s) disconnect!', connId, err);
  });

  return conn;
};
