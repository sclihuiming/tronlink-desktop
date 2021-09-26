declare global {
  interface Window {
    tronWeb: Record<string, any>;
    electron: Record<string, any>;
  }
}

type LocalData = {
  accounts: [];
  certificate: JSON[];
  selectAccountAddress: string;
  selectedNode?: string;
  registerTag?: string;
};

type LocalData1 = {
  posts: string[]; // Expect posts to be an array of strings
};

type AddAccountParams = {
  importType: 'privateKey' | 'mnemonic' | 'ledger';
  user: {
    name: string;
    privateKey?: string;
    mnemonic?: string;
    ledgerAccounts?: any[];
    mnemonicIndexes?: number[];
  };
};

type AccountData = {
  importType: 'privateKey' | 'mnemonic' | 'ledger';
  name: string;
  address: string;
  balance?: string | number;
  type?: number;
  index?: number;
};

type DappData = {
  name: string;
  url: string;
  logo: string;
  netType: number;
  isOffice?: boolean;
};

type Response = {
  code: number;
  msg?: string;
  data?: JSON | undefined | string | [];
};

type InjectData = {
  accountInfo: {
    address: string;
    name: string;
    type: number;
  };
  nodeInfo: {
    fullNode: string;
    eventServer: string;
  };
};

type RegisterData = {
  password: string;
  confirm: string;
};

export {
  LocalData,
  LocalData1,
  AddAccountParams,
  Response,
  DappData,
  InjectData,
  RegisterData,
  AccountData,
};
