'use client';

import { Layout, Menu } from 'antd';
import { useSession } from 'next-auth/react';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        {/* Header content */}
        {session?.user?.name}
      </Header>
      <Layout>
        <Sider>
          <Menu mode="inline">
            {/* Navigation items */}
          </Menu>
        </Sider>
        <Content>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 