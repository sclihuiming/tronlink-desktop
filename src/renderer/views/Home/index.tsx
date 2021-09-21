import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  useHistory,
} from 'react-router-dom';
import { Layout, Menu, Select, Spin, Button, Modal } from 'antd';
import { get, find, size, add } from 'lodash';
import {
  UserOutlined,
  PieChartOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { RootState } from 'renderer/store';
import './Home.global.scss';
import {
  setSelectedAddress,
  getNodeList,
  changeNode,
  logOut,
} from '../../../MessageDuplex/handlers/renderApi';

import Overview from '../Overview';
import AddAccount from '../AddAccount';
import Dapp from '../Dapp';

const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;
const { Option } = Select;

type RouterData = {
  title: string;
  routerPath: string;
  parentPath?: string;
};

const routerTree = [
  {
    title: '概览',
    routerPath: '/home',
  },
  {
    title: '账户管理',
    routerPath: '/home/manager-accounts',
    parentPath: 'accountManager',
  },
  {
    title: '增加账户',
    routerPath: '/home/add-accounts',
    parentPath: 'accountManager',
  },
  {
    title: '增加ledger账户',
    routerPath: '/home/add-ledger-accounts',
    parentPath: 'accountManager',
  },
];

const headerRouterTrees: RouterData[] = [
  {
    title: '功能',
    routerPath: '/home',
  },
  {
    title: 'DApp',
    routerPath: '/home/dapp',
  },
  {
    title: '关于',
    routerPath: '/home/about',
  },
];

function renderRouter(routerTrees: RouterData[]) {
  return (
    <>
      {routerTrees.map((_routerInfo) => {
        return (
          <Menu.Item key={get(_routerInfo, 'routerPath')}>
            <Link to={get(_routerInfo, 'routerPath')}>
              {get(_routerInfo, 'title')}
            </Link>
          </Menu.Item>
        );
      })}
    </>
  );
}

function renderAccountList(accountList: [], selectedAddress: string) {
  function onChange(value: string) {
    setSelectedAddress(value);
  }

  return (
    <div className="accountList">
      <Select
        value={selectedAddress}
        className="accountSelect"
        style={{ width: 220 }}
        bordered={false}
        onChange={onChange}
      >
        {accountList.map((account: any) => {
          const { address, name } = account;
          return (
            <Option value={address} key={address}>
              {`${
                name.length > 6 ? `${name.substring(0, 6)}...` : name
              }(${address.substring(0, 6)}...${address.substring(
                address.length - 6
              )})`}
            </Option>
          );
        })}
      </Select>
    </div>
  );
}

function renderNodeList(
  nodeList: any[],
  selectNodeId: string,
  loading: boolean,
  setLoading: any
) {
  async function onChange(value: string) {
    setLoading(true);
    await changeNode(value);
    setLoading(false);
  }
  return (
    <div className="nodeList">
      <Spin spinning={loading}>
        <Select
          defaultValue={selectNodeId}
          className="accountSelect"
          style={{ width: 160 }}
          bordered={false}
          onChange={onChange}
        >
          {nodeList.map((node: any) => {
            const { nodeId, name } = node;
            return (
              <Option value={nodeId} key={nodeId}>
                {name}
              </Option>
            );
          })}
        </Select>
      </Spin>
    </div>
  );
}

function Home(props: any) {
  const match = useRouteMatch();
  const history = useHistory();
  const { accounts, selectedAddress, nodeId } = props;
  const pathname = get(props, 'location.pathname', '');
  const [collapsed, onCollapse] = useState(false);
  const [selectedKey, setSelectedKey] = useState(pathname);
  const [headerSelectedKey, setHeaderSelectedKey] = useState('/home');
  const [openKey, setOpenKey] = useState([] as string[]);
  const [nodeList, setNodeList] = useState([]);
  const [nodeLoading, setNodeLoading] = useState(false);

  async function fetchNodeList() {
    const res = await getNodeList();
    setNodeList(get(res, 'data', []));
  }

  useEffect(() => {
    fetchNodeList();
  }, []);

  useEffect(() => {
    const item = find(routerTree, (info) => pathname === info.routerPath);
    if (item) {
      const parentPath: string = get(item, 'parentPath', '');
      if (size(parentPath) > 0) {
        const parentPathArr: string[] = [];
        parentPathArr.push(parentPath);
        setOpenKey(parentPathArr);
      }
      setSelectedKey(pathname);
    }
    const headerItem = find(
      headerRouterTrees,
      (info) => pathname === info.routerPath
    );
    if (headerItem) {
      setHeaderSelectedKey(pathname);
    }
  }, [pathname]);

  useEffect(() => {}, [selectedAddress]);

  const onOpenChange: any = (openKeys: string[]) => {
    setOpenKey(openKeys);
  };

  const openModal = () => {
    Modal.confirm({
      title: '确认退出该应用?',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        logOut();
        history.push('/login');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="partOne">
          <div className={`logo ${collapsed ? 'collapsed' : ''}`} />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[headerSelectedKey]}
            selectedKeys={[headerSelectedKey]}
          >
            {renderRouter(headerRouterTrees)}
          </Menu>
        </div>
        <div className="partTwo">
          {renderNodeList(nodeList, nodeId, nodeLoading, setNodeLoading)}
          {renderAccountList(accounts, selectedAddress)}
          <div className="btnWrap">
            <Button
              type="link"
              size="small"
              className="customLink"
              onClick={openModal}
            >
              登出
            </Button>
          </div>
        </div>
      </Header>

      <Layout className="site-layout">
        {headerSelectedKey === '/home' && (
          <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
            <Menu
              theme="dark"
              defaultSelectedKeys={[selectedKey]}
              selectedKeys={[selectedKey]}
              openKeys={openKey}
              mode="inline"
              // onSelect={onSelect}
              onOpenChange={onOpenChange}
            >
              <Menu.Item key="/home" icon={<PieChartOutlined />}>
                <Link to={`${match.url}`}>概览</Link>
              </Menu.Item>
              <SubMenu
                key="accountManager"
                icon={<UserOutlined />}
                title="账户管理"
              >
                <Menu.Item key="/home/manager-accounts">
                  <Link to={`${match.url}/manager-accounts`}>管理账户</Link>
                </Menu.Item>
                <Menu.Item key="/home/add-accounts">
                  <Link to={`${match.url}/add-accounts`}>增加账户</Link>
                </Menu.Item>
                <Menu.Item key="/home/add-ledger-accounts">
                  <Link to={`${match.url}/add-ledger-accounts`}>
                    ledger添加账户
                  </Link>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
        )}
        <Layout>
          <Content style={{ margin: '10px' }}>
            <div
              className="site-layout-background"
              style={{ padding: 24, minHeight: 360 }}
            >
              <Switch>
                <Route path={`${match.path}/overview`} component={Overview} />
                <Route
                  path={`${match.path}/add-accounts`}
                  component={AddAccount}
                />
                <Route path={`${match.path}/dapp`} component={Dapp} />
                <Route path={`${match.path}`} component={Overview} />
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center', padding: '0 50px 10px 50px' }}>
            TronLink Desktop ©2021 sclihuiming@163.com
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    accounts: state.app.accounts,
    selectedAddress: state.app.selectedAddress,
    nodeId: state.app.nodeId,
  };
})(Home);
