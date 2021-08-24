/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

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
