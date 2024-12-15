'use client';

import { Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CompanyFormData {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function AddCompanyPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values: CompanyFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Компания успешно создана');
        setTimeout(() => {
          router.push('/admin/companies');
          router.refresh();
        }, 1000);
      } else {
        message.error(data.error || 'Ошибка при создании компании');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      message.error('Ошибка при создании компании');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card title="Создание новой компании" className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              name="name"
              label="Название компании"
              rules={[{ required: true, message: 'Пожалуйста, введите название компании' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Пожалуйста, введите email' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-4">
                <Button 
                  onClick={() => router.push('/admin/companies')}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                >
                  Создать компанию
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
} 