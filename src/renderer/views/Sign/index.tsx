import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
import { Spin, Button, message, Typography, Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import TronWeb from 'tronweb';
import {
  getTransactions,
  acceptConfirmation,
  rejectConfirmation,
  getSelectedAccountInfo,
  checkTransport,
} from '../../../MessageDuplex/handlers/renderApi';

import './Sign.global.scss';
import { ledgerConnectBlueTooth } from '../../../constants';

const { Paragraph } = Typography;

const limit = 120;

function Sign() {
  const [transaction, setTransaction] = useState();
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [selectAccount, setSelectAccount] = useState({});

  const intl = useIntl();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getTransactions();

      setTransaction(get(res, 'data'));
      setLoading(false);
      const selectedAccountInfo = await getSelectedAccountInfo();
      setSelectAccount(get(selectedAccountInfo, 'data', {}));
    }
    fetchData();
  }, []);

  const input = get(transaction, 'transaction.input', '');
  const functionName = get(transaction, 'functionName');
  const args = get(transaction, 'args', []);
  const messageID = get(transaction, 'messageID', '');
  const contractType: string = get(transaction, 'contractType', 'SignMessage');
  let rawDataHex = get(transaction, 'transaction.transaction.raw_data_hex', '');
  let fromAddress = '';
  if (typeof input === 'string') {
    rawDataHex = input.replace('0x', '');
  } else {
    const ownerAddress = get(input, 'owner_address');
    if (ownerAddress) {
      fromAddress = TronWeb.address.fromHex(ownerAddress);
    }
  }

  let amount = 0;
  let timer: number;

  async function checkConnectStatus(
    useBlueTooth = false,
    resolve: any,
    reject: any
  ) {
    const res = await checkTransport(useBlueTooth);
    if (res.code === 200 && res.data.success) {
      resolve();
    } else {
      // const dataStatus = get(res, 'data.status', -1);
      if (timer) {
        window.clearTimeout(timer);
      }
      const dataStatus = get(res, 'data.status', -1);
      const preId = useBlueTooth ? 'sign.tip.bluetooth' : 'sign.tip.usb';
      setTip(
        intl.formatMessage({
          id: dataStatus === -1 ? 'sign.tip.open.tron' : preId,
        })
      );

      amount += 1;
      if (amount > limit) {
        message.error(intl.formatMessage({ id: 'ledger.stepTip.failed' }));
        reject(intl.formatMessage({ id: 'ledger.stepTip.failed' }));
      } else {
        timer = window.setTimeout(
          () => checkConnectStatus(useBlueTooth, resolve, reject),
          1000
        );
      }
    }
  }

  async function waitLedgerConnect(useBlueTooth = false) {
    return new Promise((resolve, reject) => {
      checkConnectStatus(useBlueTooth, resolve, reject);
    });
  }

  const acceptFunc = async () => {
    setAcceptLoading(true);
    setLoading(true);
    if (get(selectAccount, 'importType') === 'ledger') {
      const useBlueTooth =
        get(selectAccount, 'ledgerConnectType') === ledgerConnectBlueTooth;
      setTip(
        intl.formatMessage({
          id: useBlueTooth ? 'sign.tip.bluetooth' : 'sign.tip.usb',
        })
      );
      await waitLedgerConnect(useBlueTooth).catch((error) => {
        setAcceptLoading(false);
        setLoading(false);
        setTip('');
        console.warn(error);
      });
    }
    setTip(intl.formatMessage({ id: 'sign.tip.wait.sign' }));
    await acceptConfirmation(messageID);
    setAcceptLoading(false);
    setLoading(false);
  };

  const rejectFunc = async () => {
    setRejectLoading(true);
    await rejectConfirmation(messageID);
    setRejectLoading(false);
  };
  return (
    <div className="signWrap">
      <div className="header">
        <div className="hostname">{get(transaction, 'hostname', '')}</div>
        <FormattedMessage id="sign.transaction.request.tips" />
      </div>
      <Spin spinning={loading} tip={tip} wrapperClassName="customSpin">
        <div className="greyWrap">
          <div className="tradeData scroll">
            <div className="item">
              <div className="titleWrap">
                <div className="partOne">
                  <FormattedMessage id="sign.contract.type" />
                </div>
                <div className="partTwo">
                  {intl.formatMessage({
                    id: `sign.contract.${contractType}`,
                  })}
                </div>
              </div>
              <div className="separator" style={{ margin: '8px 0' }} />
            </div>
            {size(fromAddress) > 0 && (
              <div className="item">
                <div className="titleWrap">
                  <div className="partOne">
                    <FormattedMessage id="sign.contract.fromAddress" />
                  </div>
                  <div className="partTwo">
                    <Paragraph
                      copyable={{ text: fromAddress }}
                      className="address"
                    >
                      <Tooltip
                        placement="topLeft"
                        title={fromAddress}
                        mouseEnterDelay={0.3}
                      >
                        {`${fromAddress.substring(
                          0,
                          8
                        )}...${fromAddress.substring(fromAddress.length - 8)}`}
                      </Tooltip>
                    </Paragraph>
                  </div>
                </div>
                <div className="separator" style={{ margin: '8px 0' }} />
              </div>
            )}
            {contractType === 'TriggerSmartContract' && (
              <div className="item">
                <div className="titleWrap">
                  <div className="partOne">
                    <FormattedMessage id="sign.contract.function" />
                  </div>
                  <div className="partTwo">
                    {functionName ||
                      intl.formatMessage({
                        id: 'sign.contract.function.unknown',
                      })}
                  </div>
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
            )}

            <div className="item">
              <div className="titleWrap">
                <div className="partOne">
                  <FormattedMessage id="sign.contract.meta.data" />
                </div>
                <div className="partTwo">&nbsp;</div>
              </div>
              <div className="valueWrap">{rawDataHex}</div>
            </div>
          </div>
        </div>
      </Spin>
      <div className="btnWrap">
        <Button
          shape="round"
          size="large"
          loading={rejectLoading}
          onClick={() => rejectFunc()}
        >
          <FormattedMessage id="button.reject" />
        </Button>
        <Button
          type="primary"
          shape="round"
          size="large"
          loading={acceptLoading}
          onClick={() => acceptFunc()}
        >
          <FormattedMessage id="button.sign" />
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
