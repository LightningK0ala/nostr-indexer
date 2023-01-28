import crypto from 'crypto';

export function sha1Hash(data: crypto.BinaryLike) {
  return crypto
    .createHash('sha1')
    .update(data)
    .digest('base64');
}
