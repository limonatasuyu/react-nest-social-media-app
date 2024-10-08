import React from 'react'
import { Layout, Menu } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import background from '/background.jpg'

export const Route = createFileRoute('/_AppLayout')({
  component: LayoutComponent,
})
const { Header, Sider, Content } = Layout

function LayoutComponent() {
  return (
      <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          className="logo"
          style={{
            height: "64px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.3)",
          }}
        />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Homepage</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SaveOutlined />}>
            <Link to="/saved">Saved Posts</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className="site-layout" style={{ marginLeft: 200, background: `url(${background})` }}>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Vibe Space
        </Header>
        <Content style={{ margin: "16px", marginLeft: '100px', marginRight: '100px' }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>

  )
}
