import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { get, size } from 'lodash';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { renderApi } from '../../../MessageDuplex';
import './Overview.global.scss';

function Overview(props: JSON) {
  const match = useRouteMatch();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await renderApi.getAccounts();
      setAccounts(get(res, 'data', []));
    };

    fetchData();
    // renderApi.ipcExample('renderApi.ipcExample#####&&&--------');
  }, []);

  return (
    <div className="overview">
      {size(accounts) > 0 && <div className="accountsWrap"> accountsWrap </div>}
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
  };
})(Overview);
