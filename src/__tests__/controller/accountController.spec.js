/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import { addAccount } from '../../main/controller/accountController';
import { setAuthentication } from '../../main/service/cacheService';

describe('accountController', () => {
  beforeAll(function () {
    setAuthentication('12345678');
  });
  describe('addAccount', () => {
    it('should addAccount by mnemonic', async () => {
      const params = {
        importType: 'mnemonic',
        user: {
          name: '助记词',
          mnemonic:
            'eight sound poet matter fix chicken aware much vote topic gesture deposit',
          mnemonicIndexes: [0, 1],
        },
      };
      const res = await addAccount(params);
      expect(res).to.be.a('string');
      expect(res).to.equal('成功保存');
    });
  });
});
