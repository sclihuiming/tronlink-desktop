import { get, size } from 'lodash';
import { getTronwebInstance } from './nodeController';
import { getSelectedAuthKey } from './accountController';
import { decrypt, cryptoUtil } from '../../utils';
import { getAuthentication } from '../service/cacheService';

const decryptAuthKey = async () => {
  const password = <string>getAuthentication();
  const selectedCertificate = <string>await getSelectedAuthKey();
  const encryptKey = get(selectedCertificate, 'privateKey');
  return cryptoUtil.decryptSync(encryptKey, password);
};

export async function authTransaction(transaction: any) {
  try {
    const tronWebInstance = getTronwebInstance();

    const privateKey = await decryptAuthKey();
    if (size(privateKey) === 0) {
      return transaction;
    }
    const signedTransaction = tronWebInstance.trx.sign(transaction, privateKey);

    return signedTransaction;
  } catch (error) {
    console.error('authTransaction error', error);
  }
  return false;
}

export const a = 1;
