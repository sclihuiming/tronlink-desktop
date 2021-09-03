/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { connect } from 'react-redux';
import { InfoCircleOutlined } from '@ant-design/icons';
import { renderApi } from 'MessageDuplex';
import { AddAccountParams } from 'types';

message.config({
  top: 200,
  rtl: false,
});

const AddAccount = () => {
  const [form] = Form.useForm();
  const [type, setImportType] = useState<string>('privateKey');

  const onRequiredTypeChange = (
    _: any,
    { importType }: { importType: string }
  ) => {
    console.log(importType);
    if (type !== importType) {
      setImportType(importType);
    }
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: '${label} 必须填写!',
  };

  const key = 'updatable';
  const onFinish = async (values: AddAccountParams) => {
    message.loading({ content: '正在保存...', key });
    await renderApi.addAccount(values);
    setTimeout(() => {
      message.success({ content: '保存成功!', key, duration: 2 });
    }, 1000);
  };

  return (
    <Form
      {...layout}
      form={form}
      layout="vertical"
      initialValues={{ importType: type }}
      onValuesChange={onRequiredTypeChange}
      requiredMark={true as boolean}
      validateMessages={validateMessages}
      onFinish={onFinish}
    >
      <Form.Item label="导入方式" name="importType">
        <Radio.Group>
          <Radio.Button value="privateKey">私钥</Radio.Button>
          <Radio.Button value="mnemonic">助记词</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name={['user', 'name']}
        label="账户名称"
        required
        tooltip="账户名称是必须填写的"
        rules={[{ required: true }]}
      >
        <Input placeholder="" />
      </Form.Item>
      {type === 'privateKey' && (
        <Form.Item
          name={['user', 'privateKey']}
          label="私钥"
          required
          tooltip={{
            title: '私钥是必须填写的',
            icon: <InfoCircleOutlined />,
          }}
          rules={[{ required: true }]}
        >
          <Input placeholder="" />
        </Form.Item>
      )}

      {type === 'mnemonic' && (
        <Form.Item
          name={['user', 'mnemonic']}
          label="助记词"
          required
          tooltip={{
            title: '助记词是必须填写的',
            icon: <InfoCircleOutlined />,
          }}
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default connect()(AddAccount);
