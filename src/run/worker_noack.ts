import { ConsumeMessage } from 'amqplib';
import logger from '../logger';
import { createConsumer } from '../mq/createConsumer';

(async function main() {
  const consumer = await createConsumer('task_queue', {
    assert: { durable: false },
    consume: { noAck: true },
  });

  consumer.on('message', (data: ConsumeMessage) => {
    const message = data.content.toString();
    logger.info('Received %O!', message);
    // consumer.ack(data);
  });
})();
