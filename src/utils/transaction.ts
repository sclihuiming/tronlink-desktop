/* eslint-disable no-underscore-dangle */
import TronWeb from 'tronweb';
import { BigNumber } from 'bignumber.js';

const getParamTypes = (params: any) => {
  return params.map((item: any) => item.type);
};

export function getFunctionSelector(abi: any) {
  return `${abi.name}(${getParamTypes(abi.inputs || []).join(',')})`;
}
export function decodeParams(
  message: string,
  abiCode: any,
  function_selector: string
) {
  const cutArr = <[string, string, string]>(
    function_selector.match(/(.+)\((.*)\)/)
  );
  if (cutArr[2] !== '') {
    const filterAbi = abiCode.find(
      (abi: any) => getFunctionSelector(abi) === function_selector
    );
    if (filterAbi) {
      const names = filterAbi.inputs
        .map((item: any) => item.name)
        .filter((name: any) => !!name);
      const types = filterAbi.inputs.map((item: any) => item.type);
      const output = message.toString().startsWith('0x')
        ? message
        : `0x${message}`;
      const decodeMessage = TronWeb.utils.abi.decodeParams(
        names,
        types,
        output
      );

      return names.map((name: string, index: number) => {
        const type = types[index];
        let value = decodeMessage[name];
        if (type === 'address') {
          value = TronWeb.address.fromHex(decodeMessage[name]);
        } else if (type === 'trcToken' || type.indexOf('int') > -1) {
          let hex = value;
          if (value && value._hex) {
            hex = value._hex;
          }
          value = new BigNumber(hex).toFixed();
        }
        return { name, type, value };
      });
    }
    return [];
  }
  return [];
}
