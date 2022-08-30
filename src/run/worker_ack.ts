import { ConsumeMessage } from 'amqplib';
import logger from '../logger';
import { createConsumer } from '../mq/createConsumer';

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

(async function main() {
  const consumer = await createConsumer('task_queue', {
    assert: { durable: false },
    consume: { noAck: false },
  });

  consumer.on('message', (data: ConsumeMessage) => {
    const message = data.content.toString();
    logger.info('Received %O!', message);

    // setTimeout(() => consumer.ack(data), rnd(1100, 1600));
    setTimeout(() => consumer.ack(data), 100);
  });
})();
