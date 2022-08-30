import logger from '../logger';
import { createProducer } from '../mq/createProducer';

(async function main() {
  const producer = await createProducer('task_queue', { assert: { durable: false } });

  let num = 0;

  setInterval(() => {
    try {
      producer.sendToQueue({ content: 'hello world!', no: ++num });
      logger.info('Message %d sent!', num);
    } catch (err: any) {
      logger.error('Message error', err);
    }
  }, 0);
})();
