'use client';

import { Layout, Menu, Avatar, ConfigProvider, Dropdown } from 'antd';
import { 
  TeamOutlined,
  CalendarOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from "next-auth/react";

const { Sider, Content } = Layout;

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  employee?: {
    position: string;
    department?: {
      name: string;
    };
  };
  avatarUrl?: string;
  image?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: "/auth/login"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          colorBgContainer: '#ffffff',
          colorText: '#000000',
          colorTextSecondary: '#6b7280',
          borderRadius: 8,
        },
        components: {
          Menu: {
            darkItemBg: '#0f0a2c',
            darkItemHoverBg: '#1a1745',
            darkItemSelectedBg: '#1a1745',
          },
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          width={250}
          style={{
            background: '#0f0a2c',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            padding: '16px 0',
            borderRight: '1px solid #1a1745',
          }}
        >
          {/* User Profile with Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="px-4 mb-8 cursor-pointer hover:bg-[#1a1745] transition-colors duration-200">
              <div className="flex items-center space-x-3 mb-2 py-2">
                <Avatar 
                  size={40} 
                  src={user?.image}
                  style={{ backgroundColor: '#1a1745' }}
                >
                  {!user?.image && `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {user?.employee?.position} {user?.employee?.department?.name ? `in ${user?.employee?.department.name}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </Dropdown>

          {/* Main Navigation */}
          <Menu
            theme="dark"
            mode="inline"
            style={{ background: 'transparent', border: 'none' }}
            items={[
              {
                key: '1',
                icon: <TeamOutlined />,
                label: 'Сотрудники',
                onClick: () => router.push('/dashboard/employees')
              },
              {
                key: '2',
                icon: <CalendarOutlined />,
                label: 'Отпуска',
                onClick: () => router.push('/dashboard/timeoff')
              },
              {
                key: '3',
                icon: <FileOutlined />,
                label: 'Документы',
                onClick: () => router.push('/dashboard/documents')
              }
            ]}
          />

          {/* Company Info */}
          <div className="absolute bottom-0 w-full p-4 border-t border-[#1a1745]">
            <div className="flex items-center space-x-3">
              <Avatar style={{ backgroundColor: '#1a1745' }}>A</Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-white">Acme Inc</span>
                <span className="text-xs text-gray-400">Owner</span>
              </div>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: 250, background: '#ffffff' }}>
          <Content style={{ margin: '24px', minHeight: 280, background: '#ffffff' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
} 