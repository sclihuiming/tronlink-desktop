import NodeCache from 'node-cache';
import { AccountData } from 'types';
import {
  accountsCacheKey,
  accountsSelectedCacheKey,
  authenticationKey,
  cacheTTL,
} from '../../constants';

const myCache = new NodeCache();

export function setAccountsCache(accounts: AccountData[]) {
  return myCache.set(accountsCacheKey, accounts, cacheTTL);
}

export function getAccountsCache(): AccountData[] {
  return myCache.get(accountsCacheKey) || [];
}

export function setSelectedAddressCache(address: string) {
  return myCache.set(accountsSelectedCacheKey, address, cacheTTL);
}

export function getSelectedAddressCache(): string {
  return myCache.get(accountsSelectedCacheKey) || '';
}

export function setAuthentication(word: string) {
  return myCache.set(authenticationKey, word, 0);
}

export function getAuthentication() {
  return myCache.get(authenticationKey);
}
