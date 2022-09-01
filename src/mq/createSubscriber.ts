import { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';

import { createConnection } from './createConnection';
import logger from '../logger';

type Options = {
  consume?: Options.Consume;
};

export const createSubscriber = async (
  exchangeName: string,
  topics: string[],
  options: Options = {}
): Promise<ChannelWrapper> => {
  const name = 'subscriber';
  const conn = createConnection(name);

  // configure channel
  // @see https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html
  const channelWrapper = conn.createChannel({
    name,
    async setup(channel: Channel) {
      // each subscriber must have exclusive queue with unique name
      const q = await channel.assertQueue('', { exclusive: true });
      const queueName = q.queue;

      await Promise.all([
        channel.assertExchange(exchangeName, 'topic', { durable: false }),
        // each subscriber must bind his queue to desired exchange and define its routing key (aka topic)
        // @see https://www.rabbitmq.com/tutorials/tutorial-four-javascript.html
        // @see https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html
        ...topics.map((topic) => channel.bindQueue(queueName, exchangeName, topic)),
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
              logger.error('Subscriber for exchange %s does not have message event listener!', exchangeName);
            }
            channelWrapper.emit('message', data);
          },
          { noAck: true, ...options.consume }
        ),
      ]);
    },
  });

  return channelWrapper;
};
