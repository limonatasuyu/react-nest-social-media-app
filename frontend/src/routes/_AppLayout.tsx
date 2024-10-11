import { useEffect, useState, createContext } from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import background from "/background.jpg";
import axios from "axios";
import toast from "react-hot-toast";
import { UserInfo } from "../interfaces";
import travelIcon from "/travel-icon.gif";
import travelIconPng from "/travel-icon.png";

export const Route = createFileRoute("/_AppLayout")({
  component: LayoutComponent,
});

const { Sider, Content } = Layout;

export const UserContext = createContext<UserInfo>({} as UserInfo);

function LayoutComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo);

  function fetchUserInfo() {
    axios
      .get("http://localhost:3000/user/me", { withCredentials: true })
      .then((response) => setUserInfo(response.data))
      .catch((error) =>
        toast.error(
          error?.message ?? "Unexpected error occured while getting user info."
        )
      );
  }

  useEffect(fetchUserInfo, []);

  return (
    <Layout
      className="min-h-screen"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        className={`fixed top-0 left-0 bottom-0 h-full overflow-auto transition-all duration-200 ${
          collapsed ? "bg-transparent" : "bg-black bg-opacity-70"
        }`}
      >
        <div className="logo h-16 m-4 bg-white bg-opacity-30" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="mt-4 flex flex-col gap-2 bg-transparent"
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Homepage</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to={`/profile?id=${userInfo._id}`}>Profile</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SaveOutlined />}>
            <Link to="/saved">Saved Posts</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
          <CustomIcon />
        </Menu>
      </Sider>

      <Layout
        className={`transition-all duration-200 ${collapsed ? "ml-20" : "ml-52"} bg-transparent`}
      >
        <Content className="m-4 mx-auto p-6 min-h-[360px] rounded-lg max-w-[1200px]">
          <UserContext.Provider value={userInfo}>
            <Outlet />
          </UserContext.Provider>
        </Content>
      </Layout>
    </Layout>
  );
}

function CustomIcon() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Menu.Item
      key="4"
      icon={
        isHovering ? (
          <img className="w-24 ml-2 transition-all duration-300 ease-in-out" src={travelIcon} />
        ) : (
          <img className="w-12 ml-2 transition-all duration-300 ease-in-out" src={travelIconPng} />
        )
      }
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="flex items-center h-fit"
      style={{ flexDirection: isHovering ? 'column' : 'row' }}
    >
      <Link
        to="/travel"
        className={`transition-all duration-300 ease-in-out ${
          isHovering ? 'text-2xl mt-2' : 'text-sm mt-0'
        }`}
      >
        Travel
      </Link>
    </Menu.Item>
  );
}
