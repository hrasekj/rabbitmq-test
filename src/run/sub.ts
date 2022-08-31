import { ConsumeMessage } from 'amqplib';
import logger from '../logger';
import { createSubscriber } from '../mq/createSubscriber';

// const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

(async function main() {
  const topics = process.argv.slice(2) || ['*.info'];
  logger.info('Topic %s', topics);
  const consumer = await createSubscriber('le_logs', topics, {
    // assert: { durable: false },
    // consume: { noAck: true },
  });

  consumer.on('message', (data: ConsumeMessage) => {
    if (!data) {
      logger.info('Received empty message!');
      return;
    }
    const message = data.content.toString();
    logger.info('Received %O!', message);
  });
})();
