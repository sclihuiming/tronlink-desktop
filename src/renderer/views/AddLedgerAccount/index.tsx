import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Steps, Radio, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';

import './LedgerAccount.global.scss';
import LedgerConnect from '../../components/LedgerConnect';

const { Step } = Steps;

function RenderStepOne() {
  const [btnDisable, setBtnDisable] = useState(false);

  const onChange = (e: any) => {
    console.log(e.target.value);
  };

  const connectLedger = () => {
    setBtnDisable(true);
  };

  return (
    <div className="ledgerConnect">
      <Radio.Group onChange={onChange} defaultValue="usb" disabled={btnDisable}>
        <Radio.Button value="usb">
          <FormattedMessage id="ledger.connect.usb" />
        </Radio.Button>
        <Radio.Button value="bluetooth" disabled>
          <FormattedMessage id="ledger.connect.bluetooth" />
        </Radio.Button>
      </Radio.Group>

      <Button
        type="dashed"
        className="customBtn"
        disabled={btnDisable}
        onClick={connectLedger}
      >
        <FormattedMessage id="button.ledger.connect" />
      </Button>

      {btnDisable && (
        <div className="loadingWrap">
          <LedgerConnect />
        </div>
      )}
    </div>
  );
}

function RenderStepTwo() {
  return <div className="ledgerAccounts">13</div>;
}

function LedgerAccount() {
  const [current, setCurrent] = useState(0);

  const intl = useIntl();

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <div className="ledgerAccountWrap">
      <Steps current={current}>
        <Step title={intl.formatMessage({ id: 'ledger.step.one' })} />
        <Step title={intl.formatMessage({ id: 'ledger.step.two' })} />
      </Steps>
      <div className="content">
        {current === 0 && <RenderStepOne />}
        {current === 1 && <RenderStepTwo />}
      </div>
    </div>
  );
}

export default connect()(LedgerAccount);
