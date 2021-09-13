declare global {
  interface Window {
    tronWeb: Record<string, any>;
    electron: Record<string, any>;
  }
}

type LocalData = {
  accounts: JSON[];
  certificate: JSON[];
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
  };
};

type DappData = {
  name: string;
  url: string;
  logo: string;
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

export {
  LocalData,
  LocalData1,
  AddAccountParams,
  Response,
  DappData,
  InjectData,
};
