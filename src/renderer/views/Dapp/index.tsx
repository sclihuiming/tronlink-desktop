import { get, find } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Tooltip,
  Input,
  Spin,
  List,
  Card,
  Avatar,
  Badge,
  Alert,
  Popconfirm,
} from 'antd';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  HomeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

import { RootState } from 'renderer/store';
import { DappData } from '../../../types';
import {
  getCurrentAccountAndNodeInfo,
  removeDappData as renderApiRemoveDappData,
} from '../../../MessageDuplex/handlers/renderApi';
import DappModal from '../../components/DappModal';
import './Dapp.global.scss';

const { Meta } = Card;

function Dapp(props: any) {
  const { selectedAddress, nodeId, accounts } = props;
  const webviewRef = React.useRef<any>(null);
  const dappListDefault: DappData[] = get(props, 'dappList', []);
  const [dappList, setDappList] = useState(dappListDefault);
  const [mode, setMode] = useState('dapp');
  const [webviewLoading, setWebviewLoading] = useState(true);
  const [canGoBack, setGoBackStatus] = useState(false);
  const [canGoForward, setGoForwardStatus] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState('');
  const [dappUrl, setDappUrl] = useState('');

  // modal
  const [visible, setVisible] = useState(false);

  const intl = useIntl();

  // eslint-disable-next-line global-require
  const preloadPath = `file://${require('path').resolve(
    './src/preload/preload.webview.js'
  )}`;

  useEffect(() => {}, []);

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
        webviewRef.current?.send('render2Webview_simplex', {
          method: 'setNode_interval',
          params: nodeInfo,
        });
      } catch (error) {
        console.warn('setNode to webview error:', error);
      }
    })();
  }, [nodeId]);

  function webviewInitial(webview: any) {
    setWebviewLoading(false);
    setDappUrl(webview.getURL());
    setGoBackStatus(webview.canGoBack());
    setGoForwardStatus(webview.canGoForward());
  }

  useEffect(() => {
    if (mode === 'webview') {
      const webview = document.getElementById('dappWebView');
      if (webview) {
        webview.addEventListener('dom-ready', () => {
          webviewInitial(webview);
        });
      }
      setTimeout(() => {
        const webviewAgain = document.getElementById('dappWebView');
        if (webviewAgain && webviewAgain.isLoading()) {
          webviewInitial(webviewAgain);
        }
      }, 15000);
    }
  }, [mode]);

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

  function goHome() {
    setMode('dapp');
  }

  function openWebview(url: string) {
    setWebviewLoading(true);
    setWebviewUrl(url);
    setDappUrl(url);
    setMode('webview');
  }

  function removeDappData(url: string) {
    renderApiRemoveDappData(url);
  }

  if (mode === 'dapp') {
    return (
      <div className="dappContainer">
        <Alert
          className="customAlert"
          message={intl.formatMessage({ id: 'dapp.page.tips' })}
          type="info"
          showIcon
        />
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={[...dappList, 'operation']}
          renderItem={(item) => {
            if (typeof item === 'string') {
              return (
                <List.Item>
                  <Card className="addNew">
                    <Button
                      icon={<PlusOutlined />}
                      type="link"
                      size="small"
                      onClick={() => {
                        setVisible(true);
                      }}
                    >
                      <FormattedMessage id="button.add.dapp" />
                    </Button>
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <Badge.Ribbon
                  text={
                    item.netType === 0
                      ? intl.formatMessage({ id: 'dapp.network.main_chain' })
                      : intl.formatMessage({ id: 'dapp.network.test_chain' })
                  }
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
                      title={
                        <div className="nameWrap">
                          <div className="name">{item.name}</div>
                          {!item.isOffice && (
                            <div
                              role="button"
                              className="btnWrap"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onKeyPress={(e) => {
                                e.stopPropagation();
                              }}
                              tabIndex={0}
                            >
                              <Popconfirm
                                title={intl.formatMessage({
                                  id: 'dapp.delete.data.tips',
                                })}
                                onConfirm={() => {
                                  removeDappData(item.url);
                                }}
                                okText={intl.formatMessage({
                                  id: 'button.delete',
                                })}
                                cancelText={intl.formatMessage({
                                  id: 'button.cancel',
                                })}
                              >
                                <Button
                                  type="dashed"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                />
                              </Popconfirm>
                            </div>
                          )}
                        </div>
                      }
                      description={item.url}
                      avatar={<Avatar src={item.logo} />}
                    />
                  </Card>
                </Badge.Ribbon>
              </List.Item>
            );
          }}
        />
        <DappModal
          visible={visible}
          closeModal={() => {
            setVisible(false);
          }}
        />
      </div>
    );
  }
  if (mode === 'webview') {
    return (
      <div className="webviewContainer">
        <div className="navigationBar">
          <div className="prevBtn">
            <Tooltip
              title={intl.formatMessage({ id: 'dapp.webview.back.tips' })}
            >
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
            <Tooltip
              title={intl.formatMessage({ id: 'dapp.webview.forward.tips' })}
            >
              <Button
                type="text"
                size="small"
                disabled={!canGoForward}
                icon={<ArrowRightOutlined />}
                onClick={goForward}
              />
            </Tooltip>
          </div>
          <div className="home">
            <Tooltip
              title={intl.formatMessage({ id: 'dapp.webview.home.tips' })}
            >
              <Button
                type="text"
                size="small"
                icon={<HomeOutlined />}
                onClick={goHome}
              />
            </Tooltip>
          </div>
          <div className="reloadBtn">
            <Tooltip
              title={intl.formatMessage({ id: 'dapp.webview.reload.tips' })}
            >
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
              src={webviewUrl}
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
