import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
import { List, Card, Avatar, Badge, Alert } from 'antd';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { CheckCircleTwoTone } from '@ant-design/icons';
import './Overview.global.scss';
import { setSelectedAddress } from '../../../MessageDuplex/handlers/renderApi';

function renderAccount(accountItem: JSON, selectedAddress: string) {
  const name = get(accountItem, 'name');
  const address = get(accountItem, 'address');
  const balance = get(accountItem, 'balance', 0);
  const formatAddress = `${address.substring(0, 8)}...${address.substring(
    address.length - 8
  )}`;

  const handleClick = () => {
    setSelectedAddress(address);
  };
  return (
    <div className="accountItem" key={address}>
      {address === selectedAddress ? (
        <div className="checked">
          <CheckCircleTwoTone />
        </div>
      ) : (
        <div
          className="circle"
          role="button"
          onClick={handleClick}
          onKeyDown={handleClick}
          tabIndex={0}
          aria-label="Mute volume"
        />
      )}
      <div className="name">{name}</div>
      <div className="address" title={address}>
        {formatAddress}
      </div>
      <div className="balance">{balance} TRX</div>
    </div>
  );
}

function Overview(props: any) {
  const { accounts: propsAccounts, selectedAddress } = props;
  const match = useRouteMatch();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setAccounts(props.accounts);
    // renderApi.ipcExample('renderApi.ipcExample#####&&&--------');
  }, [propsAccounts]);

  return (
    <div className="overview">
      {size(accounts) > 0 && (
        <div className="accountsWrap">
          {accounts.map((item) => renderAccount(item, selectedAddress))}{' '}
          {/* <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            dataSource={accounts}
            renderItem={(item) => (
              <List.Item>
                <Badge.Ribbon
                  text={item.netType === 0 ? '主网' : '测试网'}
                  color={item.netType === 0 ? 'blue' : 'gray'}
                >
                  <Card
                    hoverable
                    className="listItem"
                    onClick={() => {
                      openWebview(item.url);
                    }}
                  >
                    <Meta
                      title={item.name}
                      description={item.url}
                      avatar={<Avatar src={item.logo} />}
                    />
                  </Card>
                </Badge.Ribbon>
              </List.Item>
            )}
          /> */}
        </div>
      )}
      {size(accounts) === 0 && (
        <div className="empty">
          <Link to={`${match.url}/add-accounts`}>增加账户</Link>
        </div>
      )}
    </div>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    test: state.app.test,
    accounts: state.app.accounts,
    selectedAddress: state.app.selectedAddress,
  };
})(Overview);
