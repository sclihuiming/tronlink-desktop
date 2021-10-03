import * as bip32 from 'tiny-bip32';
import * as bip39 from 'bip39';
import TronWeb from 'tronweb';
import { pick } from 'lodash';
import { checkIsChinese } from '../../utils';

function getWordListByLanguage(language: string) {
  return bip39.wordlists[language] || bip39.wordlists.english;
}

export async function generateMnemonic(strength = 128, wordList?: string[]) {
  return bip39.generateMnemonic(strength, undefined, wordList);
}

export async function generateMnemonicChinese(strength = 128) {
  const wordList = getWordListByLanguage('chinese_simplified');
  return generateMnemonic(strength, wordList);
}

export async function getAccountAtIndex(mnemonic: string, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(`m/44'/195'/${index}'/0/0`);
  if (child && child.privateKey) {
    const privateKey = child.privateKey.toString('hex');
    const address = TronWeb.address.fromPrivateKey(privateKey);

    return {
      privateKey,
      address,
      index,
    };
  }
  return {};
}

export async function validateMnemonic(mnemonic: string, wordList?: string[]) {
  return bip39.validateMnemonic(mnemonic, wordList);
}

export async function validateMnemonicChinese(mnemonic: string) {
  const wordList = getWordListByLanguage('chinese_simplified');
  return validateMnemonic(mnemonic, wordList);
}

export async function batchGenerateAccount(params: any) {
  const { mnemonic, page = 0, pageSize = 5 } = params;
  const isChinese = checkIsChinese(mnemonic);
  const valid = isChinese
    ? await validateMnemonicChinese(mnemonic)
    : await validateMnemonic(mnemonic);
  if (!valid) {
    return Promise.reject(new Error('Incomplete mnemonic or wrong word'));
  }

  const start = page * pageSize;
  const end = page * pageSize + pageSize;
  const promiseArr = [];
  for (let i = start; i < end; i += 1) {
    promiseArr.push(getAccountAtIndex(mnemonic, i));
  }
  const accounts = (await Promise.all(promiseArr)).map((item) => {
    return pick(item, ['address', 'index']);
  });
  return accounts;
}
