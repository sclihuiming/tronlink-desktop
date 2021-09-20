import { get, find } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, Input, Spin } from 'antd';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

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
  const [webviewLoading, setWebviewLoading] = useState(true);
  const [canGoBack, setGoBackStatus] = useState(false);
  const [canGoForward, setGoForwardStatus] = useState(false);
  const [dappUrl, setDappUrl] = useState('');

  // eslint-disable-next-line global-require
  const preloadPath = `file://${require('path').resolve(
    './src/preload/preload.webview.js'
  )}`;

  useEffect(() => {
    const webview = document.getElementById('dappWebView');
    if (webview) {
      webview.addEventListener('dom-ready', () => {
        setWebviewLoading(false);
        setDappUrl(webview.getURL());
        setGoBackStatus(webview.canGoBack());
        setGoForwardStatus(webview.canGoForward());
      });
    }
    setTimeout(() => {
      if (webviewLoading) {
        setWebviewLoading(false);
      }
    }, 3000);
  }, []);

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
        webviewRef.current?.openDevTools();
        webviewRef.current?.send('render2Webview_simplex', {
          method: 'setNode_interval',
          params: nodeInfo,
        });
      } catch (error) {
        console.warn('setNode to webview error:', error);
      }
    })();
  }, [nodeId]);

  function goBack() {
    try {
      setWebviewLoading(true);
      webviewRef.current?.goBack();
    } catch (error) {
      console.warn('goBack error:', error);
    }
  }

  function goForward() {
    try {
      setWebviewLoading(true);
      webviewRef.current?.goForward();
    } catch (error) {
      console.warn('goForward error:', error);
    }
  }

  function reload() {
    try {
      setWebviewLoading(true);
      webviewRef.current?.reload();
    } catch (error) {
      console.warn('reload error:', error);
    }
  }

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
        <div className="navigationBar">
          <div className="prevBtn">
            <Tooltip title="点击可后退">
              <Button
                type="text"
                size="small"
                disabled={!canGoBack}
                icon={<ArrowLeftOutlined />}
                onClick={goBack}
              />
            </Tooltip>
          </div>
          <div className="nextBtn">
            <Tooltip title="点击可前进">
              <Button
                type="text"
                size="small"
                disabled={!canGoForward}
                icon={<ArrowRightOutlined />}
                onClick={goForward}
              />
            </Tooltip>
          </div>
          <div className="reloadBtn">
            <Tooltip title="重新加载此页">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={reload}
              />
            </Tooltip>
          </div>
          <div className="url">
            <Input size="small" placeholder="url" disabled value={dappUrl} />
          </div>
        </div>
        <div className="webviewWrap">
          <Spin spinning={webviewLoading} size="large">
            <webview
              ref={webviewRef}
              id="dappWebView"
              src="http://123.56.166.152:18096/#/home"
              // src="https://nile.tronscan.org"
              preload={preloadPath}
              webpreferences="contextIsolation=false"
              // style={{ display: 'inline-flex', width: '640px', height: '480px' }}
            />
          </Spin>
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
