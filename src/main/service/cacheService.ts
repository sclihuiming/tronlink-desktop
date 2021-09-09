import NodeCache from 'node-cache';
import {
  accountsCacheKey,
  accountsSelectedCacheKey,
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
