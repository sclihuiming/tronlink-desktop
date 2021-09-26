/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Steps, Radio, Button, Checkbox, Divider, Form, Input } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';
import { get, size } from 'lodash';

import './LedgerAccount.global.scss';
import LedgerConnect from '../../components/LedgerConnect';
import { getAddressInfo } from '../../../MessageDuplex/handlers/renderApi';

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
  const { accountList = [], setAccountList } = props;
  const [btnLoading, setBtnLoading] = useState(false);

  const intl = useIntl();
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const getAddressInfos = async () => {
    setBtnLoading(true);
    const startIndex =
      get(accountList, `${size(accountList) - 1}.index`, 0) + 1;
    const addressInfos = [];
    for (let index = startIndex; index < startIndex + 5; index += 1) {
      const res = await getAddressInfo(index);
      if (res.code === 200 && res.data.success) {
        addressInfos.push(res.data);
      } else {
        index -= 1;
      }
    }
    console.log('load account finish:', addressInfos);
    setAccountList && setAccountList(accountList.concat(addressInfos));
    setBtnLoading(false);
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
          <Checkbox.Group className="checkboxGroup scroll">
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
          <Button type="dashed" loading={btnLoading} onClick={getAddressInfos}>
            <FormattedMessage id="button.account.loadMore" />
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="button.account.import" />
          </Button>
        </Form.Item>
      </Form>
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
            setAccountList={setAccountList}
          />
        )}
      </div>
    </div>
  );
}

export default connect()(LedgerAccount);
