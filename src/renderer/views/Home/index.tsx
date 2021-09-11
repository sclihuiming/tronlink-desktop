import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { get, find, size } from 'lodash';
import {
  UserOutlined,
  PieChartOutlined,
  TeamOutlined,
  FileOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { RootState } from 'renderer/store';
import './Home.global.scss';

import Overview from '../Overview';
import AddAccount from '../AddAccount';
import Dapp from '../Dapp';

const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

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

function Home(props: any) {
  const match = useRouteMatch();
  const pathname = get(props, 'location.pathname', '');
  const [collapsed, onCollapse] = useState(false);
  const [selectedKey, setSelectedKey] = useState(pathname);
  const [headerSelectedKey, setHeaderSelectedKey] = useState('/home');
  const [openKey, setOpenKey] = useState([] as string[]);

  useEffect(() => {}, []);

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

  const onOpenChange: any = (openKeys: string[]) => {
    setOpenKey(openKeys);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className={`logo ${collapsed ? 'collapsed' : ''}`} />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[headerSelectedKey]}
          selectedKeys={[headerSelectedKey]}
        >
          {renderRouter(headerRouterTrees)}
        </Menu>
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
    test: state.app.test,
  };
})(Home);
