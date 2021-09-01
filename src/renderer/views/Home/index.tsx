import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  UserOutlined,
  PieChartOutlined,
  TeamOutlined,
  FileOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { RootState } from 'renderer/store';
import './Home.global.scss';

import Hello from '../Hello';

const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

function Home(props: JSON) {
  const match = useRouteMatch();
  const [collapsed, onCollapse] = useState(false);

  useEffect(() => {}, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div className={`logo ${collapsed ? 'collapsed' : ''}`} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Link to={`${match.url}/hello`}>Option 1</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            Option 2
          </Menu.Item>
          <SubMenu key="sub1" icon={<UserOutlined />} title="User">
            <Menu.Item key="3">Tom</Menu.Item>
            <Menu.Item key="4">Bill</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9" icon={<FileOutlined />}>
            Files
          </Menu.Item>
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
              <Route path={`${match.path}/hello`} component={Hello} />
              <Route path={`${match.path}`}> 测试 </Route>
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
