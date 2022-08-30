import util from 'node:util';

export default {
  info(...args: any[]) {
    console.log(new Date().toISOString(), util.format(...args));
  },
  error(...args: any[]) {
    console.error(new Date().toISOString(), util.format(...args));
  },
};
