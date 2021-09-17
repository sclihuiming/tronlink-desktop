/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button, Spin, message } from 'antd';
import { get } from 'lodash';
import './Login.global.scss';
import { isNewUser, registerNewUser } from 'MessageDuplex/handlers/renderApi';
import { sleep } from '../../../utils';

const createStars = () => {
  const arr = new Array(10).fill(0);
  let amount = 0;
  return (
    <div className="stars">
      {arr.map(() => {
        amount += 1;
        return <div className="star" key={`key${amount}`} />;
      })}
    </div>
  );
};

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const formTailLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16, offset: 8 },
};

const key = 'register';

function Login() {
  const [form] = Form.useForm();
  const history = useHistory();
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkIsNew() {
      const result = await isNewUser();
      console.log('result:', result);
      setIsNew(!!get(result, 'data'));
    }
    checkIsNew();
  }, []);

  const register = async (values: any) => {
    let res;
    try {
      setLoading(true);
      res = await registerNewUser(values);
      await sleep(1300);
      setLoading(false);
      history.push('/home');
    } catch (errorInfo) {
      setLoading(false);
      message.success({ content: res.msg, key, duration: 2 });
    }
  };
  return (
    <div className="loginWrap">
      {createStars()}
      <Spin spinning={loading}>
        <div className="operationWrap">
          {isNew && (
            <div className="register">
              <Form
                form={form}
                name="dynamic_rule"
                size="middle"
                onFinish={register}
              >
                <Form.Item
                  {...formItemLayout}
                  name="password"
                  label="登陆密码"
                  rules={[
                    {
                      required: true,
                      message: '请输入密码',
                    },
                    {
                      min: 8,
                      max: 100,
                      message: '至少8个字符',
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  name="confirm"
                  label="确认密码"
                  rules={[
                    {
                      required: true,
                      message: '请输入你的确认密码',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('两次输入的密码不匹配')
                        );
                      },
                    }),
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="请再次输入密码" />
                </Form.Item>
                <Form.Item {...formTailLayout}>
                  <Button type="primary" htmlType="submit">
                    注册新用户
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
          {!isNewUser && <div className="login">12</div>}
        </div>
      </Spin>
    </div>
  );
}

export default connect()(Login);
