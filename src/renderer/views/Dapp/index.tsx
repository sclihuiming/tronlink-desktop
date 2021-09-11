import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { DappData } from '../../../types';
import './Dapp.global.scss';

function renderDappItem(dapp: DappData) {
  return (
    <div className="dappItem" key={dapp.url}>
      <div className="logoWrap">
        <img src={dapp.logo} alt="" />
      </div>
      <div className="nameWrap">
        <div className="name">{dapp.name}</div>
      </div>
    </div>
  );
}

function Dapp(props: any) {
  const dappListDefault: DappData[] = get(props, 'dappList', []);
  const [dappList, setDappList] = useState(dappListDefault);

  useEffect(() => {
    setDappList(dappListDefault);
  }, [dappListDefault]);

  return (
    <div className="dappContainer">
      <div className="listWrap">{dappList.map(renderDappItem)}</div>
    </div>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    dappList: state.dapp.dappList,
  };
})(Dapp);
