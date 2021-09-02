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

const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

const routerTree = [
  {
    routerPath: '/home/manager-accounts',
    parentPath: 'accountManager',
  },
  {
    routerPath: '/home/add-accounts',
    parentPath: 'accountManager',
  },
  {
    routerPath: '/home/add-ledger-accounts',
    parentPath: 'accountManager',
  },
];

function Home(props: any) {
  const match = useRouteMatch();
  const pathname = get(props, 'location.pathname', '');
  const [collapsed, onCollapse] = useState(false);
  const [selectedKey, setSelectedKey] = useState(pathname);
  const [openKey, setOpenKey] = useState([] as string[]);

  useEffect(() => {}, []);
  useEffect(() => {
    const item = find(routerTree, (info) => pathname === info.routerPath);
    const parentPath: string = get(item, 'parentPath', '');
    if (size(parentPath) > 0) {
      const parentPathArr: string[] = [];
      parentPathArr.push(parentPath);
      setOpenKey(parentPathArr);
    }
    setSelectedKey(pathname);
  }, [pathname]);

  const onOpenChange: any = (openKeys: string[]) => {
    setOpenKey(openKeys);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div className={`logo ${collapsed ? 'collapsed' : ''}`} />
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
      <Layout className="site-layout">
        <Header className="header">
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ margin: '10px' }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            <Switch>
              <Route path={`${match.path}/overview`} component={Overview} />
              <Route path={`${match.path}/add-accounts`}> 增加账户 </Route>
              <Route path={`${match.path}`} component={Overview} />
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          TronLink Desktop ©2021 sclihuiming@163.com
        </Footer>
      </Layout>
    </Layout>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    test: state.app.test,
  };
})(Home);
