'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

declare global {
  interface Window {
    YaAuthSuggest?: {
      init: (
        params: {
          client_id: string;
          response_type: string;
          redirect_uri: string;
        },
        rootUrl: string,
        options: {
          view: string;
          parentId: string;
          buttonSize: 'm' | 's' | 'l';
          buttonView: 'main' | 'simple';
          buttonTheme: 'light' | 'dark';
          buttonBorderRadius: string;
          buttonIcon: string;
        }
      ) => Promise<{ handler: () => Promise<any> }>;
    };
  }
}

export default function YandexAuthButtonClient() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const initialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToken = async (data: any) => {
    try {
      const response = await fetch('/api/auth/yandex/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: data.access_token }),
      });

      if (!response.ok) {
        throw new Error('Ошибка верификации токена');
      }

      const userData = await response.json();
      login(userData.user);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  };

  const initYandexAuth = async () => {
    console.log('initYandexAuth start', {
      initialized: initialized.current,
      hasYaAuthSuggest: !!window.YaAuthSuggest,
      hasContainer: !!containerRef.current,
      containerId: containerRef.current?.id
    });

    if (!initialized.current && window.YaAuthSuggest && containerRef.current) {
      initialized.current = true;
      console.log('Начинаем инициализацию виджета...', {
        time: new Date().toISOString(),
        YaAuthSuggest: typeof window.YaAuthSuggest
      });

      try {
        const { handler } = await window.YaAuthSuggest.init(
          {
            client_id: '36e55332194045a19d8f419a1008ed4b',
            response_type: 'token',
            redirect_uri: 'http://localhost:3000/api/auth/callback/yandex',
          },
          'http://localhost:3000',
          {
            view: 'button',
            parentId: containerRef.current.id,
            buttonView: 'main',
            buttonTheme: 'light',
            buttonSize: 'm',
            buttonBorderRadius: '0'
          }
        );

        console.log('Init promise resolved', {
          time: new Date().toISOString(),
          handlerType: typeof handler
        });

        const data = await handler();
        console.log('Handler executed', {
          time: new Date().toISOString(),
          dataType: typeof data,
          data
        });
        handleToken(data);

      } catch (error) {
        console.error('Error in initialization:', {
          time: new Date().toISOString(),
          error
        });
        initialized.current = false;
      }
    } else {
      console.log('Skipping initialization', {
        initialized: initialized.current,
        hasYaAuthSuggest: !!window.YaAuthSuggest,
        hasContainer: !!containerRef.current
      });
    }
  };

  useEffect(() => {
    if (window.YaAuthSuggest && !initialized.current) {
      initYandexAuth();
    }
  }, []);

  return (
    <div ref={containerRef} id="yandex-auth-button" className="my-4" suppressHydrationWarning />
  );
} 