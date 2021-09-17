import NodeCache from 'node-cache';
import {
  accountsCacheKey,
  accountsSelectedCacheKey,
  authenticationKey,
  cacheTTL,
} from '../../constants';

const myCache = new NodeCache();

export function setAccountsCache(accounts: JSON[]) {
  return myCache.set(accountsCacheKey, accounts, cacheTTL);
}

export function getAccountsCache() {
  return myCache.get(accountsCacheKey);
}

export function setSelectedAddressCache(address: string) {
  return myCache.set(accountsSelectedCacheKey, address, cacheTTL);
}

export function getSelectedAddressCache() {
  return myCache.get(accountsSelectedCacheKey);
}

export function setAuthentication(word: string) {
  return myCache.set(authenticationKey, word, 0);
}

export function getAuthentication() {
  return myCache.get(authenticationKey);
}
