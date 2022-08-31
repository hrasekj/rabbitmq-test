import logger from '../logger';
import { createPublisher } from '../mq/createPublisher';

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const rndLvl = () => {
  const lvls = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  const index = rnd(0, lvls.length - 1);
  return lvls[index];
};

(async function main() {
  const producer = await createPublisher('le_logs', {
    // assert: { durable: false }
  });

  let num = 0;

  setInterval(async () => {
    try {
      const no = ++num;
      const lvl = rndLvl();
      await producer.publish(`level.${lvl}`, { lvl, content: 'hello world!', no });
      logger.info('Message %d %s published!', num, lvl);
    } catch (err: any) {
      logger.error('Message error', err);
    }
  }, 1000);
})();
