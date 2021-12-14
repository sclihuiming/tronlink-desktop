import Transport from '@ledgerhq/hw-transport-node-hid-singleton';
import BluetoothTransport from '@ledgerhq/hw-transport-node-ble';
import AppTrx from '@ledgerhq/hw-app-trx';
import { size } from 'lodash';
import { transactionJsonToProtoBuf } from 'tron-util/src/utils/tronWeb';
import { byteArray2hexStr } from 'tron-util/src/utils/bytes';
import log from 'electron-log';
import { sleep } from '../../utils';

const retryTime = 2;
const openTimeout = 3000;
const listenTimeout = 15000;
const delayAfterFirstPairing = 4000;

let bluetoothTransport: any;
let timer: any;

function getPath(index = 0) {
  return `44'/195'/${index}'/0/0`;
}

async function resetBlueTransportTimer(time = 10000) {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    if (bluetoothTransport) {
      log.info('timeout timer:', bluetoothTransport.id);
      bluetoothTransport.close();
      BluetoothTransport.disconnect((<any>bluetoothTransport).id);
    }
    timer = null;
    bluetoothTransport = null;
  }, time);
}

async function createTransport(bluetooth = false) {
  try {
    if (bluetooth) {
      let transport;
      if (bluetoothTransport) {
        transport = bluetoothTransport;
        resetBlueTransportTimer();
      } else {
        await sleep(delayAfterFirstPairing);
        transport = await BluetoothTransport.create(openTimeout, listenTimeout);
        bluetoothTransport = transport;
        resetBlueTransportTimer();
      }
      return transport;
    }
    return await Transport.create(openTimeout, listenTimeout);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function createTransportRetry(
  bluetooth = false,
  _retryTime = 0
): Promise<any> {
  try {
    let transport;
    if (bluetooth) {
      if (bluetoothTransport) {
        transport = bluetoothTransport;
        resetBlueTransportTimer();
      } else {
        await sleep(delayAfterFirstPairing);
        transport = await BluetoothTransport.create(openTimeout, listenTimeout);
        bluetoothTransport = transport;
        resetBlueTransportTimer();
      }
    } else {
      transport = await Transport.create(openTimeout, listenTimeout);
    }
    return transport;
  } catch (error) {
    log.error('error:', error);
    if (_retryTime < retryTime) {
      const nowRetry = _retryTime + 1;
      return createTransportRetry(bluetooth, nowRetry);
    }
    return await Promise.reject(error);
  }
}

export async function checkTransport(bluetooth = false) {
  let transport;
  let deviceModel;
  try {
    log.info('start:', bluetooth);
    transport = await createTransport(bluetooth);
    deviceModel = transport.deviceModel;
    const trx = new AppTrx(transport);
    const address = await trx.getAddress(getPath(0), false);
    log.info('address:', address);
    return {
      success: true,
    };
  } catch (error) {
    log.error('error:', error);

    if (size(deviceModel) > 0) {
      return {
        success: false,
        status: -1, // connect but error
      };
    }
    return {
      success: false,
      status: -2, // not connect
    };
  } finally {
    if (transport && !bluetooth) {
      transport.close();
    }
  }
}

async function getAccount(index = 0, boolDisplay = false, bluetooth?: boolean) {
  let transport;
  try {
    // transport = await Transport.create();
    transport = await createTransportRetry(bluetooth, 0);
    const trx = new AppTrx(transport);
    const path = getPath(index);
    const { address } = await trx.getAddress(path, boolDisplay);
    log.info('address:', address);
    return {
      success: true,
      address,
      index,
    };
  } catch (error) {
    log.error('getAccount error:', error);
    return {
      success: false,
    };
  } finally {
    if (transport && !bluetooth) {
      transport.close();
    }
  }
}

export async function getAddressInfo(params: any) {
  return getAccount(params.index, params.boolDisplay, params.useBlueTooth);
}

export async function isCorrectAddress(fromAddress: string, index = 0) {
  const { address: targetAddress } = await getAccount(index);
  return targetAddress === fromAddress;
}

async function signPersonalMessage(
  transaction: any,
  index = 0,
  bluetooth?: boolean
) {
  let transport;
  try {
    // transport = await Transport.create();
    transport = await createTransportRetry(bluetooth);
    const trx = new AppTrx(transport);
    const path = getPath(index);

    const signTransaction = await trx.signPersonalMessage(path, transaction);
    return signTransaction;
  } catch (error) {
    return await Promise.reject(error);
  } finally {
    if (transport && !bluetooth) {
      transport.close();
    }
  }
}

async function signTransactionTool(
  transaction: any,
  index = 0,
  bluetooth?: boolean
) {
  let transport;
  try {
    // transport = await Transport.create();
    transport = await createTransportRetry(bluetooth);
    const trx = new AppTrx(transport);
    const path = getPath(index);

    const signedResponse = await trx.signTransaction(
      path,
      transaction.hex,
      transaction.info
    );
    return signedResponse;
  } catch (error) {
    return await Promise.reject(error);
  } finally {
    if (transport && !bluetooth) {
      transport.close();
    }
  }
}

async function buildTransactionSigner(
  transaction: any,
  input: any,
  accountIndex = 0,
  bluetooth?: boolean
) {
  try {
    if (typeof input === 'string' && typeof transaction === 'string') {
      return await signPersonalMessage(transaction, accountIndex, bluetooth);
    }
    const transactionObj = transactionJsonToProtoBuf(transaction);
    const rawDataHex = byteArray2hexStr(
      transactionObj.getRawData().serializeBinary()
    );
    const tokenInfo: any[] = [];

    const signedResponse = await signTransactionTool(
      {
        hex: transaction.raw_data_hex || rawDataHex,
        info: tokenInfo,
      },
      accountIndex,
      bluetooth
    );

    // transaction.signature = [signedResponse];
    if (Array.isArray(transaction.signature)) {
      if (!transaction.signature.includes(signedResponse))
        transaction.signature.push(signedResponse);
    } else {
      transaction.signature = [signedResponse];
    }
    return transaction;
  } catch (error) {
    return await Promise.reject(error);
  } finally {
    resetBlueTransportTimer(100000);
  }
}

export async function signTransactionByLedger(
  fromAddress: string,
  index: number,
  transaction: any,
  input: any,
  bluetooth?: boolean
): Promise<any> {
  try {
    const { address: targetAddress } = await getAccount(
      index,
      false,
      bluetooth
    );
    if (fromAddress !== targetAddress) {
      if (bluetooth) {
        return await signTransactionByLedger(
          fromAddress,
          index,
          transaction,
          input,
          false
        );
      }
      throw new Error(`Expect to get ${fromAddress} but get ${targetAddress}`);
    }
    if (transaction === undefined) {
      return await Promise.reject(new Error('invalid transaction'));
    }
    resetBlueTransportTimer(700000);
    return await buildTransactionSigner(transaction, input, index, bluetooth);
  } catch (error) {
    return await Promise.reject(error);
  }
}
