'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    YaSendSuggestToken?: (originUrl: string) => void;
  }
}

export default function YandexCallbackPage() {
  useEffect(() => {
    // После загрузки SDK отправляем токен обратно на страницу авторизации
    if (window.YaSendSuggestToken) {
      window.YaSendSuggestToken('http://localhost:3000/auth/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Script 
        src="https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js"
        onLoad={() => {
          if (window.YaSendSuggestToken) {
            window.YaSendSuggestToken('http://localhost:3000/auth/login');
          }
        }}
      />
      <div>Выполняется авторизация...</div>
    </div>
  );
} 