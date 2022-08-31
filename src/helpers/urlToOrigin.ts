import { URL } from 'node:url';
import { Options } from 'amqplib';

export const urlToOrigin = (url: string | Options.Connect) => {
  if (typeof url === 'string') {
    const { protocol, hostname, port, pathname } = new URL(url);
    return `${protocol}//${hostname}:${port || 5672}${pathname || '/'}`;
  }

  const { protocol, hostname, port, vhost } = url;
  return `${protocol}://${hostname}:${port}${vhost}`;
};
