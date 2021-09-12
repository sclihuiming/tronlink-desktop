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
  const [mode, setMode] = useState('webview');
  // eslint-disable-next-line global-require
  const preloadPath = `file://${require('path').resolve(
    './src/preload/preload.webview.js'
  )}`;

  useEffect(() => {
    setDappList(dappListDefault);
  }, [dappListDefault]);

  if (mode === 'dapp') {
    return (
      <div className="dappContainer">
        <div className="listWrap">{dappList.map(renderDappItem)}</div>
      </div>
    );
  }
  if (mode === 'webview') {
    return (
      <div className="webviewContainer">
        <div className="webviewWrap">
          <webview
            id="dappWebView"
            src="http://123.56.166.152:18096/#/home"
            preload={preloadPath}
            webpreferences="contextIsolation=false"
            // style={{ display: 'inline-flex', width: '640px', height: '480px' }}
          />
        </div>
      </div>
    );
  }
  return null;
}

export default connect((state: RootState, ownProps) => {
  return {
    dappList: state.dapp.dappList,
  };
})(Dapp);
