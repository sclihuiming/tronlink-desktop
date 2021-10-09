import { size } from 'lodash';
import { RegisterData } from 'types';
import { app } from 'electron';
import log from 'electron-log';
import path from 'path';

import { getDBInstance } from '../store/index';
import { EN_US, systemTag, ZH_CN } from '../../constants';
import { decrypt, encrypt, cryptoUtil } from '../../utils';
import { getAuthentication, setAuthentication } from '../service/cacheService';
import { changeLanguage } from '../../MessageDuplex/handlers/mainApi';

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
    log.error('login error:', error);
    return Promise.reject(error);
  }
}

export async function isLogin() {
  return !!getAuthentication();
}

export async function logOut() {
  setAuthentication('');
}

// 设置
export async function getLanguage() {
  const dbInstance = await getDBInstance();
  let lang = dbInstance.get('setting.lang').value();
  if (!lang) {
    const systemLang = app.getLocale();
    if (['zh-CN', 'zh', 'zh-HK', 'zh-TW'].includes(systemLang)) {
      lang = ZH_CN;
    } else {
      lang = EN_US;
    }
  }
  return lang;
}

export async function setLanguage(lang: string) {
  const dbInstance = await getDBInstance();
  dbInstance.set('setting.lang', lang).write();
  changeLanguage(lang);
  return true;
}
