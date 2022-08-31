import { ConsumeMessage } from 'amqplib';
import logger from '../logger';
import { createConsumer } from '../mq/createConsumer';

(async function main() {
  const noAck = process.argv.slice(2)[0] === '--noAck';

  const consumer = await createConsumer('task_queue', {
    assert: { durable: false },
    consume: { noAck },
  });

  consumer.on('message', (data: ConsumeMessage) => {
    const message = data.content.toString();
    logger.info('Received %O!', message);

    if (!noAck) {
      setTimeout(() => consumer.ack(data), 100);
    }
  });
})();
