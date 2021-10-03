/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import { batchGenerateAccount } from '../../main/controller/mnemonicController';

describe('mnemonicController', () => {
  let mnemonic;

  beforeAll(function () {
    mnemonic =
      'eight sound poet matter fix chicken aware much vote topic gesture deposit';
  });

  describe('batchGenerateAccount', () => {
    it('should batchGenerateAccount five accounts', async () => {
      const page = 0;
      const pageSize = 5;
      const accounts = await batchGenerateAccount({
        mnemonic,
        page,
        pageSize,
      });
      expect(accounts).to.be.an('array');
      expect(accounts.length).to.equal(5);
    });
  });
});
