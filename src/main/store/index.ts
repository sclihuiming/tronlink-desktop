import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
// import { LocalData } from 'types';
import { createDataFile } from '../../utils/index';

let db: any;

export async function initLocalData(): Promise<void> {
  if (!db) {
    const filePath: string = createDataFile();
    const adapter = new FileSync(filePath);
    db = low(adapter);
    await db.read();
  }
}

export function getData(keyChain: string) {
  return db.get(keyChain).value();
}

export function isExist(key: string): boolean {
  return db.has(key).value();
}

export async function getDBInstance() {
  await initLocalData();
  return db;
}
