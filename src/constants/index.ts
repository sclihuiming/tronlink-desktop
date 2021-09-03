import { join } from 'path';

export const test = '';
export const storePath = join(__dirname, '../../data');
export const storeFileName = 'db.json';
export const defaultLocalData = {
  accounts: [],
  certificate: [],
};
export const simplexMessageEntryType = {
  main2Render: 'main2Render_simplex',
  render2Main: 'render2Main_simplex',
};
export const duplexMessageEntryType = {
  main2Render: 'main2Render_duplex',
  render2Main: 'render2Main_duplex',
};
