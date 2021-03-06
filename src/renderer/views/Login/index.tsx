/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button, Spin, message, Switch } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { LockOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import './Login.global.scss';
import {
  isNewUser,
  registerNewUser,
  login,
} from '../../../MessageDuplex/handlers/renderApi';
import SwitchLang from '../../components/SwitchLang';
import { setLoginStatus } from '../../reducers/appReducer';

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
  wrapperCol: { span: 24 },
};

const formTailLayout = {
  wrapperCol: { span: 24 },
};

const key = 'loginPage';

function Login(props: any) {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const inputRef = React.useRef<any>(null);
  const history = useHistory();
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState({});

  const intl = useIntl();

  useEffect(() => {
    forceUpdate({});
    async function checkIsNew() {
      const result = await isNewUser();
      setIsNew(!!get(result, 'data'));
      setTimeout(() => {
        inputRef.current?.focus({
          cursor: 'all',
        });
      });
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
      props.updateLoginStatus(true);
      history.push('/home');
    } catch (errorInfo) {
      setLoading(false);
      message.success({ content: res.msg, key, duration: 2 });
    }
  };

  const loginAction = async (params: any) => {
    let res;
    try {
      setLoading(true);
      res = await login(params.password);
      if (get(res, 'code') !== 200) {
        throw new Error(res.msg);
      }
      await sleep(1300);
      setLoading(false);
      props.updateLoginStatus(true);
      history.push('/home');
    } catch (errorInfo) {
      setLoading(false);
      message.error({ content: res.msg, key, duration: 2 });
    }
  };
  return (
    <Spin spinning={loading} size="large">
      <div className="loginWrap">
        <div className="lang">
          <SwitchLang />
        </div>
        {createStars()}
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
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'rules.password.require',
                      }),
                    },
                    {
                      min: 8,
                      max: 100,
                      message: intl.formatMessage(
                        { id: 'rules.min.characters' },
                        { amount: 8 }
                      ),
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    ref={inputRef}
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder={intl.formatMessage({
                      id: 'login.input.placeholder',
                    })}
                  />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  name="confirm"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'rules.password.confirm',
                      }),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            intl.formatMessage({
                              id: 'rules.password.not_match',
                            })
                          )
                        );
                      },
                    }),
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder={intl.formatMessage({
                      id: 'register.input_confirm.placeholder',
                    })}
                  />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24, offset: 6 }} shouldUpdate>
                  {() => (
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={
                        !form.isFieldsTouched(true) ||
                        !!form
                          .getFieldsError()
                          .filter(({ errors }) => errors.length).length
                      }
                    >
                      <FormattedMessage id="button.register" />
                    </Button>
                  )}
                </Form.Item>
              </Form>
            </div>
          )}
          {!isNew && (
            <div className="login">
              <Form
                form={loginForm}
                name="dynamic_rule"
                size="middle"
                layout="inline"
                onFinish={loginAction}
              >
                <Form.Item
                  {...formItemLayout}
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'rules.password.require',
                      }),
                    },
                    {
                      min: 8,
                      max: 100,
                      message: intl.formatMessage(
                        { id: 'rules.min.characters' },
                        { amount: 8 }
                      ),
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    ref={inputRef}
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder={intl.formatMessage({
                      id: 'login.input.placeholder',
                    })}
                  />
                </Form.Item>
                <Form.Item {...formTailLayout} shouldUpdate>
                  {() => (
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={
                        !loginForm.isFieldsTouched(true) ||
                        !!loginForm
                          .getFieldsError()
                          .filter(({ errors }) => errors.length).length
                      }
                    >
                      <FormattedMessage id="button.login" />
                    </Button>
                  )}
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
}

export default connect(null, { updateLoginStatus: setLoginStatus })(Login);
