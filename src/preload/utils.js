module.exports = {
  injectPromise: (func, tronWeb, ...args) => {
    return new Promise((resolve, reject) => {
      args.push((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
      func(args, tronWeb);
    });
  },
};
