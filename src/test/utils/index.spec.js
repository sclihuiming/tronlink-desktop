/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import { encryptSync, decryptSync } from '../../utils/crypro';

describe('Utils', () => {
  let text;
  let password;
  let encryptText;

  beforeAll(function () {
    text = 'test---weqrqwerqwer 一一 我爱你,  ❤️ 哈哈哈哈, (*&&&^%$#####%^&';
    password = '12345678';
  });

  describe('encryptSync', () => {
    it('should encrypt data', async () => {
      const res = encryptSync(text, password);
      expect(res).to.be.an('object');
      expect(res.version).to.equal(3);
      expect(res.crypto).to.be.an('object');
      expect(res.crypto.cipher).to.equal('aes-128-ctr');
      expect(res.crypto.kdf).to.equal('scrypt');
      expect(res.crypto.kdfparams).to.be.an('object');
      expect(res.crypto.cipherparams).to.be.an('object');
      expect(res.crypto.ciphertext).to.be.a('string');
      expect(res.crypto.mac).to.be.a('string');
      encryptText = JSON.stringify(res);
    });
  });

  describe('decryptSync', () => {
    it('should decrypt data success', () => {
      const decryptStr = decryptSync(encryptText, password);
      expect(decryptStr).to.equal(text);
    });

    it('should throw invalid password', () => {
      const invalidPassword = '123214325423';
      const invalidEncryptText = 'eqwrqwerqwe';
      expect(() => decryptSync(encryptText, invalidPassword)).throw();
      expect(() => decryptSync(invalidEncryptText, password)).throw();
    });
  });
});
