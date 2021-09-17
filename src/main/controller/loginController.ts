import { size } from 'lodash';
import { setAuthentication, getAuthentication } from '../service/cacheService';

export async function login(password: string) {
  return true;
}

export async function firstLogin(password: string) {
  if (size(password) === 0) {
    return new Error('password invalid');
  }
  setAuthentication(password);
  return true;
}

export async function isLogin() {
  const hasPass = await getAuthentication();
  return !!hasPass;
}
