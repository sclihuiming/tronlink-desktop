import { Response, DappData } from 'types';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';

const dappList: DappData[] = [
  {
    name: 'justSwap',
    url: 'http://123.56.166.152:18096/#/home',
    logo: 'https://justswap.org/static/media/logo.273db171.svg',
  },
  {
    name: 'justSwap',
    url: 'https://justswap.org/',
    logo: 'https://justswap.org/static/media/logo.273db171.svg',
  },
  {
    name: 'tronscan',
    url: 'https://tronscan.io',
    logo: 'https://tronscan.io/favicon.png?v=1',
  },
  {
    name: 'nile tronscan',
    url: 'https://nile.tronscan.org',
    logo: 'https://tronscan.io/favicon.png?v=1',
  },
  {
    name: 'justStable',
    url: 'https://just.tronscan.org/#/home',
    logo: 'https://just.tronscan.org/favicon.ico',
  },
  {
    name: 'justLend',
    url: 'https://justlend.just.network/#/home',
    logo: 'https://justlend.just.network/mainLogo.svg',
  },
];

export async function addDappData(data: DappData): Promise<Response> {
  mainApi.setDappList(dappList);
  return <Response>{
    code: 200,
  };
}

export async function getDappList(): Promise<Response> {
  return <Response>{
    code: 200,
    data: dappList,
  };
}
