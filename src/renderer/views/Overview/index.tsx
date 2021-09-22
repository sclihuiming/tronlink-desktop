import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
import { List, Card, Badge, Typography, Tooltip, Button } from 'antd';
import { Link, useRouteMatch } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { AccountData } from 'types';
import './Overview.global.scss';
import { setSelectedAddress } from '../../../MessageDuplex/handlers/renderApi';

const { Meta } = Card;
const { Paragraph } = Typography;

function renderAccount(accountItem: AccountData, selectedAddress: string) {
  const name = get(accountItem, 'name', '');
  const address = get(accountItem, 'address', '');
  const balance = get(accountItem, 'balance', 0);
  const formatAddress = `${address.substring(0, 8)}...${address.substring(
    address.length - 8
  )}`;

  const handleClick = () => {
    setSelectedAddress(address);
  };
  return (
    <Card className="accountItem">
      <Meta
        title={name}
        description={
          <div className="accountDetail">
            <Paragraph copyable={{ text: address }} className="address">
              <Tooltip
                placement="topLeft"
                title={address}
                mouseEnterDelay={0.3}
              >
                {formatAddress}
              </Tooltip>
            </Paragraph>
            <div className="balance">{balance} TRX</div>
            <div className="btnWrap">
              <Button
                type="link"
                shape="round"
                disabled={address === selectedAddress}
                onClick={handleClick}
              >
                <FormattedMessage id="account.switch.current" />
              </Button>
            </div>
          </div>
        }
      />
    </Card>
  );
}

function Overview(props: any) {
  const { accounts: propsAccounts, selectedAddress } = props;
  const match = useRouteMatch();
  const [accounts, setAccounts] = useState([] as AccountData[]);

  const intl = useIntl();

  useEffect(() => {
    setAccounts(props.accounts);
    // renderApi.ipcExample('renderApi.ipcExample#####&&&--------');
  }, [propsAccounts]);

  return (
    <div className="overview">
      {size(accounts) > 0 && (
        <div className="accountsWrap">
          {/* {accounts.map((item) => renderAccount(item, selectedAddress))}{' '} */}
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            dataSource={accounts}
            renderItem={(item) => {
              return (
                <List.Item>
                  {item.address === selectedAddress ? (
                    <Badge.Ribbon
                      text={intl.formatMessage({ id: 'account.current' })}
                    >
                      {renderAccount(item, selectedAddress)}
                    </Badge.Ribbon>
                  ) : (
                    renderAccount(item, selectedAddress)
                  )}
                </List.Item>
              );
            }}
          />
        </div>
      )}
      {size(accounts) === 0 && (
        <div className="empty">
          <Link to={`${match.url}/add-accounts`}>
            <FormattedMessage id="button.add.account" />
          </Link>
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
