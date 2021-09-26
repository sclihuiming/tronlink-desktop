/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';
import { message } from 'antd';

import './LedgerConnect.global.scss';
import {
  checkTransport,
  getAddressInfo,
} from '../../../MessageDuplex/handlers/renderApi';

const limit = 120;

export default function LedgerConnect(props: any) {
  const { gotoNext, setAccountList, gotoPrev } = props;
  const [status, setStatus] = useState(0);

  const intl = useIntl();

  let amount = 0;
  let timer: NodeJS.Timeout;

  async function getAddressInfos() {
    const addressInfos = [];
    for (let index = 0; index < 5; index += 1) {
      const res = await getAddressInfo(index);
      if (res.code === 200 && res.data.success) {
        addressInfos.push(res.data);
      } else {
        index -= 1;
      }
    }
    // TODO:  return props
    console.log('load account finish:', addressInfos);
    setAccountList && setAccountList(addressInfos);
    gotoNext && gotoNext();
  }

  async function checkConnectStatus() {
    const res = await checkTransport();
    console.log('res', res);
    if (res.code === 200 && res.data.success) {
      try {
        setStatus(2);
        await getAddressInfos();
      } catch (error) {
        setStatus(1);
        timer = setTimeout(checkConnectStatus, 1000);
      }
    } else {
      setStatus(1);
      amount += 1;
      if (timer) {
        clearTimeout(timer);
      }
      console.log('amount:', amount);
      if (amount > limit) {
        gotoPrev && gotoPrev();
        message.error(intl.formatMessage({ id: 'ledger.stepTip.failed' }));
      } else {
        console.log('324234234-----');
        timer = setTimeout(checkConnectStatus, 1000);
      }
    }
  }

  useEffect(() => {
    checkConnectStatus();
  }, []);

  return (
    <div className="ledgerConnect">
      <div className="loading">
        <LoadingOutlined style={{ fontSize: '30px' }} />
      </div>
      <div className="stepTip">
        {status === 0 && <FormattedMessage id="ledger.stepTip.connectToPC" />}
        {status === 1 && <FormattedMessage id="ledger.stepTip.openTheTron" />}
        {status === 2 && <FormattedMessage id="ledger.stepTip.finish" />}
      </div>
    </div>
  );
}
