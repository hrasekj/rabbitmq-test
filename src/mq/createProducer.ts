import { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { Options } from 'amqplib';
import safeStringify from 'fast-safe-stringify';

import { createConnection } from './createConnection';

type Options = {
  assert?: Options.AssertQueue;
};

type Producer = {
  sendToQueue(content: any): Promise<void>;
};

export const createProducer = async (queueName: string, options: Options = {}): Promise<Producer> => {
  const conn = createConnection();

  // configure channel
  const channelWrapper = conn.createChannel({
    name: 'producer',
    async setup(channel: Channel) {
      await channel.assertQueue(queueName, options.assert);
    },
  });

  return {
    async sendToQueue(content) {
      let message: Buffer;

      if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
        message = Buffer.from(content.toString());
      } else if (Buffer.isBuffer(content)) {
        message = content;
      } else {
        message = Buffer.from(safeStringify(content));
      }

      await channelWrapper.sendToQueue(queueName, message);
    },
  };
};
