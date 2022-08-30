import logger from '../logger';
import { createProducer } from '../mq/createProducer';

(async function main() {
  const producer = await createProducer('task_queue', { assert: { durable: false } });

  let num = 0;

  setInterval(async () => {
    try {
      await producer.sendToQueue({ content: 'hello world!', no: num++ });
      logger.info('Message sent!');
    } catch (err: any) {
      logger.error('Message error', err);
    }
  }, 100);
})();
