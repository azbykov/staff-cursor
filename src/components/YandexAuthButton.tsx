'use client';

import dynamic from 'next/dynamic';

const YandexAuthButton = dynamic(
  () => import('./YandexAuthButtonClient'),
  { ssr: false }
);

export default YandexAuthButton;