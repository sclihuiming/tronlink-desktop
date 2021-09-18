/* eslint-disable no-bitwise */
import {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from 'crypto';
import { nanoid } from 'nanoid';
import sha3 from 'js-sha3';
import { get } from 'lodash';

const encryptionAlgorithm = 'aes-128-ctr';

function aesEncrypt(encodedStr: Buffer, key: Buffer, iv: Buffer): Buffer {
  const cipher = createCipheriv(encryptionAlgorithm, key, iv);

  let encryptBuffer = cipher.update(encodedStr);
  // const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);
  const finalBuffer = cipher.final();
  encryptBuffer = Buffer.concat(
    [encryptBuffer, finalBuffer],
    encryptBuffer.length + finalBuffer.length
  );

  return encryptBuffer;
}

function aesDecrypt(encryptText: Buffer, key: Buffer, iv: Buffer): Buffer {
  const decipher = createDecipheriv(encryptionAlgorithm, key, iv);

  let decryptedBuffer = decipher.update(encryptText);
  const finalBuffer = decipher.final();

  decryptedBuffer = Buffer.concat(
    [decryptedBuffer, finalBuffer],
    decryptedBuffer.length + finalBuffer.length
  );

  return decryptedBuffer;
}

export function encryptSync(text: string, password: string, options: any = {}) {
  let client = get(options, 'client');
  if (!client) {
    client = 'hamlin_awesome';
  }

  let salt = null;
  if (options.salt) {
    salt = Buffer.from(options.salt);
  } else {
    salt = randomBytes(32);
  }

  // Override initialization vector
  let iv = null;
  if (options.iv) {
    iv = Buffer.from(options.iv);
    if (iv.length !== 16) {
      throw new Error('invalid iv');
    }
  } else {
    iv = randomBytes(16);
  }

  // Override the scrypt password-based key derivation function parameters
  let N = 1 << 14;
  let r = 8;
  let p = 1;
  if (options.scrypt) {
    if (options.scrypt.N) {
      N = options.scrypt.N;
    }
    if (options.scrypt.r) {
      r = options.scrypt.r;
    }
    if (options.scrypt.p) {
      p = options.scrypt.p;
    }
  }

  const option = {
    N,
    r,
    p,
  };

  const key = scryptSync(password, salt, 64, option);

  const derivedKey = key.slice(0, 16);
  const macPrefix = key.slice(16, 32);

  // This will be used to encrypt the mnemonic phrase (if any)
  // const mnemonicKey = key.slice(32, 64);

  // Encrypt the private key
  const cipherText = aesEncrypt(Buffer.from(text), derivedKey, iv);

  // Compute the message authentication code, used to check the password
  const mac = sha3.keccak256(
    Buffer.concat([macPrefix, cipherText], macPrefix.length + cipherText.length)
  );

  // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
  const data = {
    id: nanoid(),
    version: 3,
    crypto: {
      cipher: 'aes-128-ctr',
      cipherparams: {
        iv: iv.toString('hex'),
      },
      ciphertext: cipherText.toString('hex'),
      kdf: 'scrypt',
      kdfparams: {
        salt: salt.toString('hex'),
        n: N,
        dklen: 32,
        p,
        r,
      },
      mac,
    },
  };

  return data;
}

export function decryptSync(
  encryptText: string,
  password: string,
  nonStrict = false
) {
  const data = JSON.parse(nonStrict ? encryptText.toLowerCase() : encryptText);
  // cal  key
  const kdf = get(data, 'crypto.kdf');

  if (kdf.toLowerCase() === 'scrypt') {
    const throwError = (name: string, value: any) => {
      return new Error(
        `invalid key-derivation function parameters, ${name}, ${value}`
      );
    };
    const salt = Buffer.from(get(data, 'crypto.kdfparams.salt'), 'hex');
    const N = parseInt(get(data, 'crypto.kdfparams.n'), 10);
    const r = parseInt(get(data, 'crypto.kdfparams.r'), 10);
    const p = parseInt(get(data, 'crypto.kdfparams.p'), 10);

    // Check for all required parameters
    if (!N || !r || !p) {
      throwError('kdf', kdf);
    }

    // Make sure N is a power of 2
    if ((N & (N - 1)) !== 0) {
      throwError('N', N);
    }

    const dkLen = parseInt(get(data, 'crypto.kdfparams.dklen'), 10);
    if (dkLen !== 32) {
      throwError('dklen', dkLen);
    }

    const options = {
      N,
      r,
      p,
    };
    const key = scryptSync(password, salt, 64, options);
    const cipherText = Buffer.from(get(data, 'crypto.ciphertext'), 'hex');
    const computedMAC = sha3.keccak256(
      Buffer.concat([key.slice(16, 32), cipherText], 16 + cipherText.length)
    );
    if (computedMAC !== get(data, 'crypto.mac').toLowerCase()) {
      throw new Error('invalid password');
    }
    const iv = Buffer.from(get(data, 'crypto.cipherparams.iv'), 'hex');
    const decryptHex = aesDecrypt(cipherText, key.slice(0, 16), iv);
    const decryptStr = decryptHex.toString();
    return decryptStr;
  }
  throw new Error(`unsupported key-derivation function, kdf, ${kdf}`);
}
