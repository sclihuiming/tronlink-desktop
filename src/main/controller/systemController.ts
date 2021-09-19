import { size } from 'lodash';
import { RegisterData } from 'types';
import { getDBInstance } from '../store/index';
import { systemTag } from '../../constants';
import { decrypt, encrypt, cryptoUtil } from '../../utils';
import { getAuthentication, setAuthentication } from '../service/cacheService';

export async function setRegisterTag(encryptTag: string) {
  const dbInstance = await getDBInstance();
  dbInstance.set('registerTag', encryptTag).write();
  return true;
}

export async function getRegisterTag() {
  const dbInstance = await getDBInstance();
  return dbInstance.get('registerTag').value();
}

export async function isNewUser() {
  return !(await getRegisterTag());
}

export async function registerNewUser(params: RegisterData) {
  if (params.password !== params.confirm) {
    return Promise.reject(new Error('password is invalid'));
  }
  try {
    const encryptTag = cryptoUtil.encryptSync(systemTag, params.password);
    await setRegisterTag(JSON.stringify(encryptTag));
    setAuthentication(params.password);
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function login(password: string) {
  try {
    const tag = await getRegisterTag();
    if (size(tag) === 0 || size(password) === 0) {
      return new Error('password or data is invalid');
    }
    cryptoUtil.decryptSync(tag, password);
    setAuthentication(password);
    return true;
  } catch (error) {
    console.error('error:', error);
    return Promise.reject(error);
  }
}

export async function isLogin() {
  return !!getAuthentication();
}

export async function logOut() {
  setAuthentication('');
}
