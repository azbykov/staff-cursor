'use client';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { StyleProvider } from '@ant-design/cssinjs';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StyleProvider hashPriority="high">
        <ConfigProvider
          locale={ruRU}
          theme={{
            token: {
              fontFamily: 'var(--font-geist-sans)',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </StyleProvider>
    </SessionProvider>
  );
} 