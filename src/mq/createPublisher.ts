import { Channel } from 'amqp-connection-manager';
import { Options } from 'amqplib';
import { contentToBuffer } from '../helpers/contentToBuffer';
import { createConnection } from './createConnection';

type Options = {
  assert?: Options.AssertExchange;
};

type Publisher = {
  publish(key: string, content: any): Promise<void>;
};

export const createPublisher = async (exchangeName: string, options: Options = {}): Promise<Publisher> => {
  const name = 'publisher';
  const conn = createConnection(name);

  // configure channel
  const channelWrapper = conn.createChannel({
    name,
    async setup(channel: Channel) {
      await channel.assertExchange(exchangeName, 'topic', options.assert);
    },
  });

  return {
    async publish(key, content) {
      await channelWrapper.publish(exchangeName, key, contentToBuffer(content));
    },
  };
};
