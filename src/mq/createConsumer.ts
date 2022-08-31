import { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';

import { createConnection } from './createConnection';
import logger from '../logger';

type Options = {
  assert?: Options.AssertQueue;
  consume?: Options.Consume;
  prefetch?: number;
};

export const createConsumer = async (queueName: string, options: Options = {}): Promise<ChannelWrapper> => {
  const name = 'consumer';
  const conn = createConnection(name);

  // configure channel
  const channelWrapper = conn.createChannel({
    name,
    async setup(channel: Channel) {
      await Promise.all([
        channel.assertQueue(queueName, options.assert),
        channel.prefetch(options.prefetch || 0),
        channel.consume(
          queueName,
          (data: ConsumeMessage | null) => {
            if (data === null) {
              // null means channel is cancelled
              // @see https://www.rabbitmq.com/consumer-cancel.html
              // TODO how to handle this situation?
              return;
            }

            if (channelWrapper.listenerCount('message') === 0) {
              logger.error('Consumer for queue %s does not have message event listener!', queueName);
            }
            channelWrapper.emit('message', data);
          },
          options.consume
        ),
      ]);
    },
  });

  return channelWrapper;
};
