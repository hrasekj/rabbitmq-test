import { Channel } from 'amqp-connection-manager';
import { Options } from 'amqplib';
import { contentToBuffer } from '../helpers/contentToBuffer';
import { createConnection } from './createConnection';

type Options = {
  assert?: Options.AssertQueue;
};

type Producer = {
  sendToQueue(content: any): Promise<void>;
};

export const createProducer = async (queueName: string, options: Options = {}): Promise<Producer> => {
  const name = 'producer';
  const conn = createConnection(name);

  // configure channel
  const channelWrapper = conn.createChannel({
    name,
    async setup(channel: Channel) {
      await channel.assertQueue(queueName, options.assert);
    },
  });

  return {
    async sendToQueue(content) {
      const done = await channelWrapper.sendToQueue(queueName, contentToBuffer(content));

      if (!done) {
        return new Promise((resolve) => channelWrapper.once('drain', resolve));
      }
    },
  };
};
