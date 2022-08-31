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
      await channelWrapper.sendToQueue(queueName, contentToBuffer(content));
    },
  };
};
