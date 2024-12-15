'use client';

import { Card, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import YandexAuthButton from '@/components/YandexAuthButton';
import Link from 'next/link';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, router]);

  const onFinish = async (values: LoginForm) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Ошибка авторизации');
      }

      const data = await response.json();
      login(data.user);
      message.success('Успешная авторизация!');

      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || '/dashboard');
      router.refresh();

    } catch (error) {
      message.error('Ошибка при входе в систему');
    }
  };

  if (isAuthenticated) {
    return <div />;
  }

  return (
    <Card bordered={false} className="shadow-md">
      <h1 className="text-2xl font-bold text-center mb-8">Вход в систему</h1>
      
      <YandexAuthButton />

      <Divider>или</Divider>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
        suppressHydrationWarning
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Введите корректный email' }
          ]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="Email" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Войти
          </Button>
        </Form.Item>

        <div className="text-center">
          <Link 
            href="/auth/register/step1" 
            className="text-blue-600 hover:text-blue-800"
          >
            Зарегистрировать компанию
          </Link>
        </div>
      </Form>
    </Card>
  );
} 