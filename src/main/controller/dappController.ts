import { Response, DappData } from 'types';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';

const dappList: DappData[] = [
  {
    name: 'justSwap',
    url: 'http://123.56.166.152:18096/#/home',
    logo: 'https://justswap.org/static/media/flowLogo.f1235f7c.svg',
    netType: 1,
  },
  {
    name: 'justSwap',
    url: 'https://justswap.org/',
    logo: 'https://justswap.org/static/media/flowLogo.f1235f7c.svg',
    netType: 0,
  },
  {
    name: 'tronscan',
    url: 'https://tronscan.io',
    logo: 'https://tronscan.io/favicon.png?v=1',
    netType: 0,
  },
  {
    name: 'nile tronscan',
    url: 'https://nile.tronscan.org',
    logo: 'https://tronscan.io/favicon.png?v=1',
    netType: 1,
  },
  {
    name: 'justStable',
    url: 'https://just.tronscan.org/#/home',
    logo: 'https://just.tronscan.org/favicon.ico',
    netType: 0,
  },
  {
    name: 'justLend',
    url: 'https://justlend.just.network/#/home',
    logo: 'https://justlend.just.network/mainLogo.svg',
    netType: 0,
  },
];

export async function addDappData(data: DappData): Promise<any> {
  mainApi.setDappList(dappList);
  return null;
}

export async function getDappList(): Promise<any> {
  return dappList;
}
