import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Radio, message } from 'antd';
import { addDappData } from 'MessageDuplex/handlers/renderApi';

export default function DappModal(props: any) {
  const [form] = Form.useForm();
  const { visible, closeModal } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);

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
      message.success({ content: '添加成功', key, duration: 2 });
    } else {
      message.error({ content: res.msg || '...', key, duration: 2 });
    }
    setConfirmLoading(false);
  };

  return (
    <Modal
      title="增加Dapp网站"
      maskClosable={false}
      closable={false}
      visible={visible}
      okText="添加"
      cancelText="取消"
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
          label="网站名称"
          tooltip="便于识别当前网站?"
          rules={[
            {
              required: true,
              message: '请输入网站名称!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="url"
          label="url"
          rules={[{ required: true, message: '请输入网站地址!' }]}
        >
          <Input onBlur={onUrlChange} />
        </Form.Item>
        <Form.Item name="logo" label="logo地址">
          <Input />
        </Form.Item>
        <Form.Item
          name="netType"
          label="网路类型"
          rules={[{ required: true, message: '请选择一个类型' }]}
        >
          <Radio.Group value={0}>
            <Radio.Button value={0}>主网</Radio.Button>
            <Radio.Button value={1}>测试网</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
