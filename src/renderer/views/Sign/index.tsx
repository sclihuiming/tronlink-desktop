import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
import { Spin, Button } from 'antd';
import { getTransactions } from '../../../MessageDuplex/handlers/renderApi';

import './Sign.global.scss';

function Sign() {
  const [transaction, setTransaction] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getTransactions();
      console.log('res', res);
      setTransaction(get(res, 'data'));
      setLoading(false);
    }
    fetchData();
  }, []);

  const input = get(transaction, 'transaction.input');
  const functionName = get(transaction, 'functionName');
  const args = get(transaction, 'args', []);
  let rawDataHex = get(transaction, 'transaction.transaction.raw_data_hex', '');
  if (typeof input === 'string') {
    rawDataHex = get(transaction, 'transaction.transaction', '').replace(
      '0x',
      ''
    );
  }
  return (
    <div className="signWrap">
      <div className="header">
        <div className="hostname">{get(transaction, 'hostname', '')}</div>
        正在请求签名
      </div>
      <Spin spinning={loading}>
        <div className="greyWrap">
          <div className="tradeData scroll">
            <div className="item">
              <div className="titleWrap">
                <div className="partOne">合约方法</div>
                <div className="partTwo">{functionName || '未知方法'}</div>
              </div>
              {size(args) > 0 ? (
                <div className="valueWrap">
                  {args.map(({ name, value }) => {
                    return (
                      <div key={name}>
                        <div className="name">{name}:</div>
                        <div className="value">{value}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="separator" style={{ margin: '8px 0' }} />
              )}
            </div>
            <div className="item">
              <div className="titleWrap">
                <div className="partOne">rawDataHex</div>
                <div className="partTwo">&nbsp;</div>
              </div>
              <div className="valueWrap">{rawDataHex}</div>
            </div>
          </div>
        </div>
      </Spin>
      <div className="btnWrap">
        <Button shape="round" size="large">
          拒绝
        </Button>
        <Button type="primary" shape="round" size="large">
          签名
        </Button>
      </div>
    </div>
  );
}

export default connect((state: RootState) => {
  return {
    accounts: state.app.accounts,
    selectedAddress: state.app.selectedAddress,
  };
})(Sign);
