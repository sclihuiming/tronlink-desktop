import { get, find } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { DappData } from '../../../types';
import {
  getCurrentAccountAndNodeInfo,
  getCurrentNodeInfo,
} from '../../../MessageDuplex/handlers/renderApi';
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
  const { selectedAddress, nodeId, accounts } = props;
  const webviewRef = React.useRef<any>(null);
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

  useEffect(() => {
    (async () => {
      const res = await getCurrentAccountAndNodeInfo();
      const accountInfo = get(res, 'data.accountInfo', {});
      try {
        webviewRef.current?.send('render2Webview_simplex', {
          method: 'setAccount_interval',
          params: accountInfo,
        });
      } catch (error) {
        console.warn('setAccount to webview error:', error);
      }
    })();
  }, [selectedAddress]);
  useEffect(() => {
    (async () => {
      const res = await getCurrentAccountAndNodeInfo();
      const nodeInfo = get(res, 'data.nodeInfo', {});
      try {
        // webviewRef.current?.openDevTools();
        webviewRef.current?.send('render2Webview_simplex', {
          method: 'setNode_interval',
          params: nodeInfo,
        });
      } catch (error) {
        console.warn('setNode to webview error:', error);
      }
    })();
  }, [nodeId]);

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
            ref={webviewRef}
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
    selectedAddress: state.app.selectedAddress,
    nodeId: state.app.nodeId,
    accounts: state.app.accounts,
  };
})(Dapp);
