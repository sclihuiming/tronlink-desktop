/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';
import { message } from 'antd';
import { get } from 'lodash';

import './LedgerConnect.global.scss';
import {
  checkTransport,
  getAddressInfo,
} from '../../../MessageDuplex/handlers/renderApi';
import { ledgerConnectBlueTooth } from '../../../constants';

const limit = 120;

export default function LedgerConnect(props: any) {
  const { gotoNext, setAccountList, gotoPrev, connectType } = props;
  const [status, setStatus] = useState(0);

  const intl = useIntl();

  let amount = 0;
  let timer: NodeJS.Timeout;

  async function getAddressInfos() {
    const addressInfos = [];
    for (let index = 0; index < 5; index += 1) {
      const res = await getAddressInfo(
        index,
        false,
        connectType === ledgerConnectBlueTooth
      );
      if (res.code === 200 && res.data.success) {
        addressInfos.push(res.data);
      } else {
        index -= 1;
      }
    }
    setAccountList && setAccountList(addressInfos);
    gotoNext && gotoNext();
  }

  async function checkConnectStatus() {
    const res = await checkTransport(connectType === ledgerConnectBlueTooth);
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
      const dataStatus = get(res, 'data.status', -1);
      setStatus(dataStatus === -1 ? 1 : 0);
      amount += 1;
      if (timer) {
        clearTimeout(timer);
      }
      if (amount > limit) {
        gotoPrev && gotoPrev();
        message.error(intl.formatMessage({ id: 'ledger.stepTip.failed' }));
      } else {
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
