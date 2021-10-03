/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import crypto from 'crypto';

const encryptionAlgorithm = 'aes-256-ctr';

export function injectPromise(func: any, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    func(...args, (err: any, res: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export function encrypt(encodedStr: string, key: string) {
  // const encoded = JSON.stringify(data);
  const cipher = crypto.createCipher(encryptionAlgorithm, key);

  let crypted = cipher.update(encodedStr, 'utf8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
}

export function decrypt(data: string, key: string) {
  const decipher = crypto.createDecipher(encryptionAlgorithm, key);

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function sleep(delay = 100) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function checkIsChinese(text: string) {
  const reg = /^[\u4e00-\u9fa5\s]+$/;
  return reg.test(text);
}
