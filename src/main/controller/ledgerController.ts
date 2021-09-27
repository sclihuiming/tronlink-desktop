import Transport from '@ledgerhq/hw-transport-node-hid-singleton';
import BluetoothTransport from '@ledgerhq/hw-transport-node-ble';
import AppTrx from '@ledgerhq/hw-app-trx';
import { getTronwebInstance } from './nodeController';

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

async function isCorrectAddress(fromAddress: string, index = 0) {
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
    return {
      success: true,
      signTransaction,
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

async function buildTransactionSigner(transaction: any, accountIndex = 0) {
  if (typeof transaction === 'string') {
    return signPersonalMessage(transaction, accountIndex);
  }
  return true;
}

export async function signTransactionByLedger(
  fromAddress: string,
  index: number,
  transaction: any
) {
  let transport;
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
    // const tronWebInstance = getTronwebInstance();

    transport = await Transport.create();
    // TODO: 签名

    return true;
  } catch (error) {
    return await Promise.reject(error);
  } finally {
    if (transport) {
      transport.close();
    }
  }
}
