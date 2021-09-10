import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
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
