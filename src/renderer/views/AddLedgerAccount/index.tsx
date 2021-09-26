import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Steps, Radio, Button, Checkbox, Divider, Form, Input } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';

import './LedgerAccount.global.scss';
import LedgerConnect from '../../components/LedgerConnect';

const { Step } = Steps;

function RenderStepOne(props: any) {
  const { gotoNext, setAccountList, gotoPrev } = props;
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
          <LedgerConnect
            gotoNext={gotoNext}
            setAccountList={setAccountList}
            gotoPrev={gotoPrev}
          />
        </div>
      )}
    </div>
  );
}

function RenderStepTwo(props: any) {
  const { accountList = [] } = props;
  const intl = useIntl();
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };
  return (
    <div className="ledgerAccounts">
      <Form
        name="ledgerAccount"
        onFinish={onFinish}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
      >
        <Form.Item
          label={intl.formatMessage({ id: 'account.add.label.name' })}
          name="accountName"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'rules.account.name',
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="selectAccounts"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'rules.ledger.account.select',
              }),
            },
          ]}
          wrapperCol={{ span: 14, offset: 6 }}
        >
          <Checkbox.Group className="checkboxGroup">
            {accountList.map((item: any) => {
              return (
                <Checkbox value={item.address} key={item.address}>
                  {item.address}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button type="dashed">
            <FormattedMessage id="button.account.loadMore" />
          </Button>
        </Form.Item>
      </Form>
      <Divider />
    </div>
  );
}

function LedgerAccount() {
  const [current, setCurrent] = useState(0);
  const [accountList, setAccountList] = useState([]);

  const intl = useIntl();

  const gotoNext = () => {
    setCurrent(current + 1);
  };

  const gotoPrev = () => {
    setCurrent(current - 1);
  };

  return (
    <div className="ledgerAccountWrap">
      <Steps current={current}>
        <Step title={intl.formatMessage({ id: 'ledger.step.one' })} />
        <Step title={intl.formatMessage({ id: 'ledger.step.two' })} />
      </Steps>
      <div className="content">
        {current === 0 && (
          <RenderStepOne
            gotoNext={gotoNext}
            gotoPrev={gotoPrev}
            setAccountList={setAccountList}
          />
        )}
        {current === 1 && (
          <RenderStepTwo
            gotoNext={gotoNext}
            gotoPrev={gotoPrev}
            accountList={accountList}
          />
        )}
      </div>
    </div>
  );
}

export default connect()(LedgerAccount);
