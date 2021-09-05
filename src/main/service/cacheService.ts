import NodeCache from 'node-cache';
import { accountsCacheKey, cacheTTL } from '../../constants';

const myCache = new NodeCache();

export function setAccountsCache(accounts: JSON[]) {
  return myCache.set(accountsCacheKey, accounts, cacheTTL);
}

export function getAccountsCache() {
  return myCache.get(accountsCacheKey);
}
