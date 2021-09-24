import bip32 from 'tiny-bip32';
import bip39 from 'bip39';
import TronWeb from 'tronweb';
import { pick } from 'lodash';

function getWordListByLanguage(language: string) {
  return bip39.wordlists[language] || bip39.wordlists.english;
}

export async function generateMnemonic(strength = 128, wordList?: string[]) {
  return bip39.generateMnemonic(strength, undefined, wordList);
}

export async function generateMnemonicChinese(strength: number) {
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

export async function batchGenerateAccount(
  mnemonic: string,
  page = 0,
  size = 5
) {
  const start = page * size;
  const end = page * (size + 1);
  const promiseArr = [];
  for (let i = start; i < end; i += 1) {
    promiseArr.push(getAccountAtIndex(mnemonic, i));
  }
  const accounts = (await Promise.all(promiseArr)).map((item) => {
    return pick(item, ['address', 'index']);
  });
  return accounts;
}
