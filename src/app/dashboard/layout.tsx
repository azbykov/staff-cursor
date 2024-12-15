'use client';

import { Layout, Menu, Avatar, ConfigProvider } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  CalendarOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const { Sider, Content } = Layout;

interface User {
  email: string;
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
  };
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
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          colorBgContainer: '#0f0a2c',
          colorBgElevated: '#1a1745',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
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
      <Layout style={{ minHeight: '100vh', background: '#0f0a2c' }}>
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
          {/* Company Logo & Name */}
          <div className="px-4 mb-8 flex items-center space-x-3">
            <Avatar style={{ backgroundColor: '#1a1745' }}>A</Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-white">Acme Inc</span>
              <span className="text-xs text-gray-400">Owner</span>
            </div>
          </div>

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

          {/* Bottom Section */}
          <div className="absolute bottom-0 w-full px-4 pb-4">
            <Menu
              theme="dark"
              mode="inline"
              style={{ background: 'transparent', border: 'none' }}
              selectable={false}
              items={[
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Настройки',
                  onClick: () => router.push('/dashboard/settings')
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Выйти',
                  onClick: handleLogout,
                  danger: true
                }
              ]}
            />
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