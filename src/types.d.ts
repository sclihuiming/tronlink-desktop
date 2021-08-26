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

export { LocalData, LocalData1 };
