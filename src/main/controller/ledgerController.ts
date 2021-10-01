import Transport from '@ledgerhq/hw-transport-node-hid-singleton';
import BluetoothTransport from '@ledgerhq/hw-transport-node-ble';
import AppTrx from '@ledgerhq/hw-app-trx';
import { size } from 'lodash';
import { transactionJsonToProtoBuf } from 'tron-util/src/utils/tronWeb';
import { byteArray2hexStr } from 'tron-util/src/utils/bytes';
import log from 'electron-log';

const retryTime = 2;
const openTimeout = 3000;
const listenTimeout = 15000;

function getPath(index = 0) {
  return `44'/195'/${index}'/0/0`;
}

async function createTransport(bluetooth = false) {
  if (bluetooth) {
    return BluetoothTransport.create(openTimeout, listenTimeout);
  }
  return Transport.create(openTimeout, listenTimeout);
}

async function createTransportRetry(
  bluetooth = false,
  _retryTime = 0
): Promise<any> {
  try {
    let transport;
    if (bluetooth) {
      transport = await BluetoothTransport.create(openTimeout, listenTimeout);
    } else {
      transport = await Transport.create(openTimeout, listenTimeout);
    }
    return transport;
  } catch (error) {
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
    await trx.getAddress(getPath(0), false);
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
    if (transport) {
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
    if (transport) {
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
    if (transport) {
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
    if (transport) {
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
    return Promise.reject(error);
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
    const { address: targetAddress } = await getAccount(index);
    if (fromAddress !== targetAddress) {
      throw new Error(`Expect to get ${fromAddress} but get ${targetAddress}`);
    }
    if (transaction === undefined) {
      return await Promise.reject(new Error('invalid transaction'));
    }
    return await buildTransactionSigner(transaction, input, index, bluetooth);
  } catch (error) {
    return await Promise.reject(error);
  }
}
