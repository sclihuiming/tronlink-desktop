import { Response, DappData } from 'types';
import axios from 'axios';
import { chain, size } from 'lodash';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';
import { getDBInstance } from '../store';

const dappList: DappData[] = [
  {
    name: 'Tronscan',
    url: 'https://tronscan.io',
    logo: 'https://tronlink-images.s3.us-east-2.amazonaws.com/image/TRONSCAN.jpg',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'JustSwap',
    url: 'https://justswap.link/?lang=en-US#/home?utm_source=tronlink',
    logo: 'https://image.tronlink.org/images/justswap_coin.png',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'SUN',
    url: 'https://sun.io/?lang=en-US',
    logo: 'https://image.tronlink.org/pictures/sun_logo.png',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'JustLend',
    url: 'https://justlend.cc/#/home',
    logo: 'https://image.tronlink.org/images/justlend3@3x.png',
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
    name: 'JUST',
    url: 'https://just.tronscan.org/#/home',
    logo: 'https://tronlink-images.s3.us-east-2.amazonaws.com/image/just_coin.jpg',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'Poloni DEX',
    url: 'https://poloniex.org/',
    logo: 'https://tronlink-images.s3.us-east-2.amazonaws.com/image/PoloniDEX.png',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'zkWrapper',
    url: 'https://zkwrapper.io/?lang=en-US#/',
    logo: 'https://image.tronlink.org/images/w202009241439.png',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'TRONLENDING',
    url: 'https://dapp.tronlink.org/#/tronLending',
    logo: 'https://tronlink-images.s3.us-east-2.amazonaws.com/image/WzQEXBQcj4kimwMtbHZM2jdf2d33sQTB.png',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'Chainz Arena',
    url: 'https://www.chainzarena.com/?platform=tl',
    logo: 'https://image.tronlink.org/images/chain_auguest.jpeg',
    netType: 0,
    isOffice: true,
  },
  {
    name: 'Bankroll',
    url: 'https://bankroll.network/?ref=TQvQfe1zgaJGaAeHT3jvqsbvJJHdnAcPWw',
    logo: 'https://tronlink-images.s3.us-east-2.amazonaws.com/image/R3CFMyKZzw5SDeXBcxHnMRTeHRwsa4wh.png',
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
