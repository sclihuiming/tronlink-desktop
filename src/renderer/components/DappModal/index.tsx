import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Radio, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { addDappData } from '../../../MessageDuplex/handlers/renderApi';

export default function DappModal(props: any) {
  const [form] = Form.useForm();
  const { visible, closeModal } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);

  const intl = useIntl();

  // const handleOk = () => {
  //   setConfirmLoading(true);
  //   setTimeout(() => {
  //     closeModal();
  //     setConfirmLoading(false);
  //   }, 2000);
  // };

  const handleCancel = () => {
    closeModal();
    form.resetFields();
  };

  const onUrlChange = (e: any) => {
    try {
      let url = e.target.value;
      if (!/^(http|https)/.test(url)) {
        url = `https://${url}`;
      }
      const urlInfo = new window.URL(url);
      const logo = `${urlInfo.protocol}//${urlInfo.host}/favicon.ico`;
      form.setFieldsValue({ logo, url });
    } catch (error) {
      console.warn('parse Url error:', error);
      form.setFieldsValue({ logo: '' });
    }
  };

  const key = 'updatable';
  const onFinish = async (values: any) => {
    setConfirmLoading(true);

    const res = await addDappData(values);
    if (res.code === 200) {
      handleCancel();
      message.success({
        content: intl.formatMessage({ id: 'message.success.add' }),
        key,
        duration: 2,
      });
    } else {
      message.error({ content: res.msg || '...', key, duration: 2 });
    }
    setConfirmLoading(false);
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'dapp.add.modal.title' })}
      maskClosable={false}
      closable={false}
      visible={visible}
      okText={intl.formatMessage({ id: 'button.add' })}
      cancelText={intl.formatMessage({ id: 'button.cancel' })}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      okButtonProps={{ htmlType: 'submit', form: 'dappForm' }}
    >
      <Form
        id="dappForm"
        labelCol={{ span: 6 }}
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        initialValues={{
          netType: 0,
        }}
      >
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: 'dapp.add.modal.label.name' })}
          tooltip={intl.formatMessage({ id: 'dapp.add.modal.tips.name' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'rules.dapp.name' }),
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="url"
          label="url"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'rules.dapp.url' }),
            },
          ]}
        >
          <Input onBlur={onUrlChange} />
        </Form.Item>
        <Form.Item
          name="logo"
          label={intl.formatMessage({ id: 'dapp.add.modal.label.logo' })}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="netType"
          label={intl.formatMessage({ id: 'dapp.add.modal.label.type' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'rules.dapp.network' }),
            },
          ]}
        >
          <Radio.Group value={0}>
            <Radio.Button value={0}>
              <FormattedMessage id="dapp.network.main_chain" />
            </Radio.Button>
            <Radio.Button value={1}>
              <FormattedMessage id="dapp.network.test_chain" />
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
