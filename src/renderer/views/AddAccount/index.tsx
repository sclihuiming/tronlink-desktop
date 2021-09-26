/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Radio, message, Checkbox } from 'antd';
import { connect } from 'react-redux';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { get, keyBy, size } from 'lodash';
import { AddAccountParams } from 'types';
import * as renderApi from '../../../MessageDuplex/handlers/renderApi';
import { RootState } from '../../store';
import { checkIsChinese, sleep } from '../../../utils';
import {
  batchGenerateAccount,
  validateMnemonic,
  validateMnemonicChinese,
} from '../../../MessageDuplex/handlers/renderApi';

import './AddAccount.global.scss';

message.config({
  top: 200,
  rtl: false,
});

const AddAccount = (props: any) => {
  const { accounts } = props;
  const [form] = Form.useForm();
  const [type, setImportType] = useState<string>('privateKey');
  const [accountList, setAccountList] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const accountInfos = keyBy(accounts, 'address');

  const intl = useIntl();

  const onRequiredTypeChange = (
    _: any,
    { importType }: { importType: string }
  ) => {
    if (type !== importType) {
      setImportType(importType);
    }
  };

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const key = 'updatable';
  const onFinish = async (values: AddAccountParams) => {
    setSubmitLoading(true);
    message.loading({
      content: intl.formatMessage({ id: 'message.save' }),
      key,
    });
    if (values.importType === 'mnemonic') {
      const mnemonicIndexes = get(values, 'user.mnemonicIndexes', []);
      values.user.mnemonicIndexes = mnemonicIndexes;
    }
    const res = await renderApi.addAccount(values);
    if (res.code === 200) {
      setTimeout(() => {
        message.success({ content: res.data, key, duration: 2 });
        form.resetFields();
        setAccountList([]);
        setSubmitLoading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        message.error({ content: res.msg || '...', key, duration: 2 });
        setSubmitLoading(false);
      }, 1000);
    }
  };

  const getAccountList = async () => {
    setBtnLoading(true);
    const mnemonic = form.getFieldValue(['user', 'mnemonic']);
    const res = await batchGenerateAccount(mnemonic, page, pageSize);
    await sleep(1000);
    if (res.code === 200) {
      setAccountList(accountList.concat(res.data));
      setPage(page + 1);
    } else {
      setAccountList([]);
      setPage(0);
    }
    setBtnLoading(false);
  };

  return (
    <Form
      {...layout}
      form={form}
      layout="horizontal"
      initialValues={{ importType: type }}
      onValuesChange={onRequiredTypeChange}
      requiredMark={true as boolean}
      onFinish={onFinish}
    >
      <Form.Item
        label={intl.formatMessage({ id: 'account.add.label.type' })}
        name="importType"
      >
        <Radio.Group>
          <Radio.Button value="privateKey">
            <FormattedMessage id="account.add.type.privatekey" />
          </Radio.Button>
          <Radio.Button value="mnemonic">
            <FormattedMessage id="account.add.type.mnemonic" />
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        wrapperCol={{ span: 12 }}
        name={['user', 'name']}
        label={intl.formatMessage({ id: 'account.add.label.name' })}
        required
        tooltip={intl.formatMessage({ id: 'account.add.tips.name' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'rules.account.name',
            }),
          },
        ]}
      >
        <Input placeholder="" />
      </Form.Item>
      {type === 'privateKey' && (
        <Form.Item
          wrapperCol={{ span: 18 }}
          name={['user', 'privateKey']}
          label={intl.formatMessage({ id: 'account.add.type.privatekey' })}
          required
          tooltip={{
            title: intl.formatMessage({ id: 'account.add.tips.privatekey' }),
            icon: <InfoCircleOutlined />,
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'rules.account.privatekey',
              }),
            },
          ]}
        >
          <Input.Password placeholder="" />
        </Form.Item>
      )}

      {type === 'mnemonic' && (
        <>
          <Form.Item
            wrapperCol={{ span: 12 }}
            name={['user', 'mnemonic']}
            label={intl.formatMessage({ id: 'account.add.type.mnemonic' })}
            required
            tooltip={{
              title: intl.formatMessage({ id: 'account.add.tips.mnemonic' }),
              icon: <InfoCircleOutlined />,
            }}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'rules.account.mnemonic',
                }),
              },
              () => ({
                async validator(_, value) {
                  if (size(value) < 10) {
                    return Promise.resolve();
                  }
                  const isChinese = checkIsChinese(value);
                  const res = isChinese
                    ? await validateMnemonicChinese(value)
                    : await validateMnemonic(value);

                  if (get(res, 'data') === true) {
                    if (size(accountList) === 0) {
                      getAccountList();
                    }
                    return Promise.resolve();
                  }
                  setAccountList([]);
                  setPage(0);
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({ id: 'rules.mnemonic.error' })
                    )
                  );
                },
              }),
            ]}
          >
            <Input.TextArea
              placeholder={intl.formatMessage({
                id: 'account.mnemonic.support.type',
              })}
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{ span: 12 }}
            name={['user', 'mnemonicIndexes']}
            label={intl.formatMessage({ id: 'account.address.label' })}
            required
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'rules.ledger.account.select',
                }),
              },
            ]}
          >
            <Checkbox.Group className="checkboxGroup scroll">
              {accountList.map((item: any) => {
                return (
                  <Checkbox
                    value={item.index}
                    key={item.address}
                    disabled={size(accountInfos[item.address]) > 0}
                  >
                    {item.address}
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
          </Form.Item>
          {size(accountList) > 0 && (
            <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
              <Button
                type="dashed"
                loading={btnLoading}
                onClick={getAccountList}
              >
                <FormattedMessage id="button.account.loadMore" />
              </Button>
            </Form.Item>
          )}
        </>
      )}

      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button type="primary" htmlType="submit" loading={submitLoading}>
          <FormattedMessage id="button.add" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default connect((state: RootState, ownProps) => {
  return {
    accounts: state.app.accounts,
  };
})(AddAccount);
