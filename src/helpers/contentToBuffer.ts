import safeStringify from 'fast-safe-stringify';

export const contentToBuffer = (content: any): Buffer => {
  if (Buffer.isBuffer(content)) {
    return content;
  }

  return Buffer.from(safeStringify(content));
};
