import { Response, DappData } from 'types';
import axios from 'axios';
import { chain, size } from 'lodash';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';
import { getDBInstance } from '../store';

const dappList: DappData[] = [
  {
    name: 'justSwap',
    url: 'https://justswap.org/',
    logo: 'https://justswap.org/static/media/flowLogo.f1235f7c.svg',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'tronscan',
    url: 'https://tronscan.io',
    logo: 'https://tronscan.io/favicon.png?v=1',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'justStable',
    url: 'https://just.tronscan.org/#/home',
    logo: 'https://just.tronscan.org/favicon.ico',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'justLend',
    url: 'https://justlend.just.network/#/home',
    logo: 'https://justlend.just.network/mainLogo.svg',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'justSwap',
    url: 'http://123.56.166.152:18096/#/home',
    logo: 'https://justswap.org/static/media/flowLogo.f1235f7c.svg',
    netType: 1,
    isOffice: true,
  },
  {
    name: 'nile tronscan',
    url: 'https://nile.tronscan.org',
    logo: 'https://tronscan.io/favicon.png?v=1',
    netType: 1,
    isOffice: true,
  },
];

export async function getDappList(): Promise<DappData[]> {
  const dbInstance = await getDBInstance();
  const customDappList = dbInstance.get('dappList', []).value();
  const list = chain(dappList).concat(customDappList).uniqBy('url').value();
  return list;
}

export async function addDappData(data: DappData): Promise<any> {
  data.isOffice = false;
  try {
    // check
    const res = await axios.get(data.url);
    if (res.status !== 200) {
      return await Promise.reject(new Error('invalid url'));
    }
    const dbInstance = await getDBInstance();
    const existDapp =
      dbInstance
        .get('dappList', [])
        .find((item: DappData) => item.url === data.url)
        .value() ||
      chain(dappList)
        .find((item: DappData) => item.url === data.url)
        .value();
    if (size(existDapp) > 0) {
      return Promise.reject(new Error('dapp已经存在'));
    }
    const isExist = dbInstance.has('dappList').value();
    if (isExist) {
      dbInstance.get('dappList', []).push(data).write();
    } else {
      dbInstance.set('dappList', [data]).write();
    }

    mainApi.setDappList(await getDappList());
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function removeDappData(url: string) {
  try {
    const dbInstance = await getDBInstance();
    dbInstance.get('dappList', []).remove({ url }).write();
    mainApi.setDappList(await getDappList());
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
}
