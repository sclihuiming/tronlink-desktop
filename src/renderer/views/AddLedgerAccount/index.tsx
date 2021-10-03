/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Steps,
  Radio,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  message,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'react-intl';
import { get, keyBy, size } from 'lodash';
import { AddAccountParams } from 'types';

import './LedgerAccount.global.scss';
import LedgerConnect from '../../components/LedgerConnect';
import {
  getAddressInfo,
  addAccount,
} from '../../../MessageDuplex/handlers/renderApi';
import { RootState } from '../../store';
import { ledgerConnectBlueTooth, ledgerConnectUSB } from '../../../constants';

const { Step } = Steps;

function RenderStepOne(props: any) {
  const { gotoNext, setAccountList, gotoPrev, setConnectType, connectType } =
    props;
  const [btnDisable, setBtnDisable] = useState(false);

  const onChange = (e: any) => {
    console.log(e.target.value);
    if ([ledgerConnectBlueTooth, ledgerConnectUSB].includes(e.target.value)) {
      setConnectType(e.target.value);
    }
  };

  const connectLedger = () => {
    setBtnDisable(true);
  };

  return (
    <div className="ledgerConnect">
      <Radio.Group
        onChange={onChange}
        defaultValue={connectType}
        disabled={btnDisable}
      >
        <Radio.Button value={ledgerConnectUSB}>
          <FormattedMessage id="ledger.connect.usb" />
        </Radio.Button>
        <Radio.Button value={ledgerConnectBlueTooth}>
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
            connectType={connectType}
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
  const { accountList = [], setAccountList, accounts } = props;
  const [btnLoading, setBtnLoading] = useState(false);

  const [form] = Form.useForm();
  const accountInfos = keyBy(accounts, 'address');

  const intl = useIntl();
  const key = 'updatable';

  const onFinish = async (params: any) => {
    const { accountName, selectAccounts } = params;
    const accountListInfos = keyBy(accountList, 'address');
    const ledgerAccounts: any[] = [];
    const accountParams = {
      importType: 'ledger',
      user: {
        ledgerAccounts,
        name: accountName,
      },
    };
    selectAccounts.forEach((address: any) => {
      const accountItem = accountListInfos[address];
      if (accountItem) {
        accountParams.user.ledgerAccounts.push(accountItem);
      }
    });
    const res = await addAccount(accountParams as AddAccountParams);
    if (res.code === 200) {
      setTimeout(() => {
        message.success({ content: res.data, key, duration: 2 });
        form.resetFields();
      }, 1000);
    } else {
      setTimeout(() => {
        message.error({ content: res.msg || '...', key, duration: 2 });
      }, 1000);
    }
  };

  const getAddressInfos = async () => {
    setBtnLoading(true);
    const startIndex =
      get(accountList, `${size(accountList) - 1}.index`, 0) + 1;
    const addressInfos = [];
    for (let index = startIndex; index < startIndex + 5; index += 1) {
      const res = await getAddressInfo(index, false);
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
        form={form}
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
                <Checkbox
                  value={item.address}
                  key={item.address}
                  disabled={size(accountInfos[item.address]) > 0}
                >
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

const RenderStepTwos = connect((state: RootState, ownProps) => {
  return {
    accounts: state.app.accounts,
  };
})(RenderStepTwo);

function LedgerAccount() {
  const [current, setCurrent] = useState(0);
  const [accountList, setAccountList] = useState([]);
  const [connectType, setConnectType] = useState(ledgerConnectUSB);

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
            connectType={connectType}
            setConnectType={setConnectType}
          />
        )}
        {current === 1 && (
          <RenderStepTwos
            gotoNext={gotoNext}
            gotoPrev={gotoPrev}
            accountList={accountList}
            setAccountList={setAccountList}
            connectType={connectType}
          />
        )}
      </div>
    </div>
  );
}

export default connect()(LedgerAccount);
