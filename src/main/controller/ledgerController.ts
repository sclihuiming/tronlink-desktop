import Transport from '@ledgerhq/hw-transport-node-hid-singleton';
// import BluetoothTransport from '@ledgerhq/hw-transport-node-ble';
import AppTrx from '@ledgerhq/hw-app-trx';
import { transactionJsonToProtoBuf } from '@tronscan/client/src/utils/tronWeb';
import { byteArray2hexStr } from '@tronscan/client/src/utils/bytes';

const retryTime = 3;

function getPath(index = 0) {
  return `44'/195'/${index}'/0/0`;
}

export async function checkTransport() {
  let transport;
  try {
    transport = await Transport.create();
    const trx = new AppTrx(transport);
    await trx.getAddress(getPath(0), false);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  } finally {
    if (transport) {
      transport.close();
    }
  }
}

async function getAccount(index = 0, boolDisplay = false) {
  let transport;
  try {
    transport = await Transport.create();
    const trx = new AppTrx(transport);
    const path = getPath(index);
    const { address } = await trx.getAddress(path, boolDisplay);
    return {
      success: true,
      address,
      index,
    };
  } catch (error) {
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
  return getAccount(params.index, params.boolDisplay);
}

export async function isCorrectAddress(fromAddress: string, index = 0) {
  const { address: targetAddress } = await getAccount(index);
  return targetAddress === fromAddress;
}

async function signPersonalMessage(transaction: any, index = 0) {
  let transport;
  try {
    transport = await Transport.create();
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

async function signTransactionTool(transaction: any, index = 0) {
  let transport;
  try {
    transport = await Transport.create();
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
  accountIndex = 0
) {
  try {
    if (typeof input === 'string' && typeof transaction === 'string') {
      return await signPersonalMessage(transaction, accountIndex);
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
      accountIndex
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
  retry = 0
): Promise<any> {
  try {
    const { address: targetAddress } = await getAccount(index);
    if (fromAddress !== targetAddress) {
      return await Promise.reject(
        new Error(`Expect to get ${fromAddress} but get ${targetAddress}`)
      );
    }
    if (transaction === undefined) {
      return await Promise.reject(new Error('invalid transaction'));
    }
    return await buildTransactionSigner(transaction, input, index);
  } catch (error) {
    if (retry < retryTime) {
      const nowRetry = retry + 1;
      return signTransactionByLedger(
        fromAddress,
        index,
        transaction,
        input,
        nowRetry
      );
    }
    return await Promise.reject(error);
  }
}
