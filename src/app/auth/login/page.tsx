'use client';

import { signIn } from 'next-auth/react';
import { Form, Input, Button, Card, Divider, Typography } from 'antd';
import Link from 'next/link';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: true,
      callbackUrl: '/dashboard'
    });
  };

  return (
    <Card className="w-full max-w-md">
      <Title level={2} className="text-center mb-6">
        Вход в систему
      </Title>

      {/* Яндекс авторизация */}
      <Button
        block
        size="large"
        onClick={() => signIn('yandex', { callbackUrl: '/dashboard' })}
        className="mb-4"
      >
        Войти через Яндекс
      </Button>

      <Divider>или</Divider>

      {/* Форма входа по email */}
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Введите корректный email' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Email" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Войти
          </Button>
        </Form.Item>
      </Form>

      {/* Ссылка на регистрацию */}
      <div className="text-center mt-4">
        <p className="text-gray-600">
          Ещё нет аккаунта?{' '}
          <Link 
            href="/auth/register" 
            className="text-blue-600 hover:text-blue-800"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </Card>
  );
} 