'use client';

import { Layout, Menu } from 'antd';
import { useRouter } from 'next/navigation';
import {
  TeamOutlined,
  BuildOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
      onClick: () => router.push('/admin')
    },
    {
      key: 'companies',
      icon: <BuildOutlined />,
      label: 'Компании',
      onClick: () => router.push('/admin/companies')
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Пользователи',
      onClick: () => router.push('/admin/users')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div className="p-4">
          <h1 className="text-xl font-bold">HR System</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 