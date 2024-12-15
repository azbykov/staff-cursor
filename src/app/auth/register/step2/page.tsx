'use client';

import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/store/registrationStore';

export default function RegisterStep2() {
  const router = useRouter();
  const { userData, setUserData, companyData } = useRegistrationStore();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyData,
          user: values,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      message.success('Регистрация успешна!');
      router.push('/auth/login');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Ошибка при регистрации');
    }
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold mb-6">
        Данные владельца
      </h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={userData}
        onFinish={onFinish}
      >
        <Form.Item
          name="firstName"
          label="Имя"
          rules={[{ required: true, message: 'Введите имя' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Фамилия"
          rules={[{ required: true, message: 'Введите фамилию' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Введите корректный email' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Пароль должен быть не менее 6 символов' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Подтверждение пароля"
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
          <Input.Password />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-between">
            <Button onClick={() => router.push('/auth/register/step1')}>
              Назад
            </Button>
            <Button type="primary" htmlType="submit">
              Завершить регистрацию
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
} 