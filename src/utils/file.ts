import {
  mkdirSync,
  accessSync,
  writeFileSync,
  constants as fsConst,
  rmSync,
} from 'fs';
import { join } from 'path';
import { LocalData } from 'types';
import { storePath, storeFileName, defaultLocalData } from '../constants/index';

export function createDataFile() {
  try {
    accessSync(storePath, fsConst.R_OK);
    accessSync(join(storePath, storeFileName), fsConst.R_OK);
  } catch (err) {
    rmSync(storePath, { force: true, recursive: true });
    mkdirSync(storePath);
    writeFileSync(
      join(storePath, storeFileName),
      JSON.stringify(<LocalData>defaultLocalData)
    );
  }
  return join(storePath, storeFileName);
}

export const a = 1;
