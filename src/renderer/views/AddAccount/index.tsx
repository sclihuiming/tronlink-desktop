/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { connect } from 'react-redux';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddAccountParams } from 'types';
import * as renderApi from '../../../MessageDuplex/handlers/renderApi';

message.config({
  top: 200,
  rtl: false,
});

const AddAccount = () => {
  const [form] = Form.useForm();
  const [type, setImportType] = useState<string>('privateKey');

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
    labelCol: { span: 8 },
    // wrapperCol: { span: 22 },
  };

  const key = 'updatable';
  const onFinish = async (values: AddAccountParams) => {
    message.loading({
      content: intl.formatMessage({ id: 'message.save' }),
      key,
    });
    const res = await renderApi.addAccount(values);
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

  return (
    <Form
      {...layout}
      form={form}
      layout="vertical"
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
          <Input placeholder="" />
        </Form.Item>
      )}

      {type === 'mnemonic' && (
        <Form.Item
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
          ]}
        >
          <Input.TextArea />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          <FormattedMessage id="button.add" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default connect()(AddAccount);
