import {
  mkdirSync,
  accessSync,
  writeFileSync,
  constants as fsConst,
  rmSync,
} from 'fs';
import { join } from 'path';
import { app } from 'electron';
import log from 'electron-log';
import { LocalData } from 'types';
import {
  storeFoldersName,
  storeFileName,
  defaultLocalData,
} from '../constants/index';

export function createDataFile() {
  let storePath = '.';

  try {
    const userDataPath = app.getPath('userData');
    storePath = join(userDataPath, storeFoldersName);
    log.info('storePath:', storePath);
    accessSync(storePath, fsConst.R_OK);
    accessSync(join(storePath, storeFileName), fsConst.R_OK);
  } catch (err) {
    rmSync(storePath, { force: true, recursive: true });
    mkdirSync(storePath, { recursive: true });
    writeFileSync(
      join(storePath, storeFileName),
      JSON.stringify(<LocalData>defaultLocalData)
    );
  }
  return join(storePath, storeFileName);
}

export const a = 1;
