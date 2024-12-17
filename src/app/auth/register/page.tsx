'use client';

import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Ошибка регистрации');
      }

      message.success('Регистрация успешна!');
      router.push('/login');
    } catch (error) {
      message.error('Ошибка при регистрации');
    }
  };

  return (
    <Card bordered={false} className="shadow-md">
      <Title level={2} className="text-center mb-8">
        Регистрация
      </Title>

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'Введите имя' }]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Имя"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Введите фамилию' }]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Фамилия"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Введите корректный email' }
          ]}
        >
          <Input 
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Пароль должен быть не менее 6 символов' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Подтвердите пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Зарегистрироваться
          </Button>
        </Form.Item>

        <div className="text-center">
          <Text className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link href="auth/login" className="text-blue-600 hover:text-blue-500">
              Войти
            </Link>
          </Text>
        </div>
      </Form>
    </Card>
  );
} 