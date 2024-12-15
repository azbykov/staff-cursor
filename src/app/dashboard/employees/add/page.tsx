'use client';

import { Form, Input, Select, Button, message, Card, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import locale from 'antd/locale/ru_RU';

interface Department {
  id: string;
  name: string;
}

export default function AddEmployeePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.departments);
      } else {
        message.error('Ошибка при загрузке департаментов');
      }
    } catch (error) {
      message.error('Ошибка при загрузке департаментов');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee: {
            firstName: values.firstName || null,
            lastName: values.lastName || null,
            position: values.position,
            phone: values.phone || null,
            birthDate: values.birthDate?.toISOString() || null,
          },
          user: {
            email: values.email,
          },
          departmentId: values.departmentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Сотрудник успешно добавлен');
        router.push('/dashboard/employees');
      } else {
        message.error(data.error || 'Ошибка при создании сотрудника');
      }
    } catch (error) {
      message.error('Ошибка при создании сотрудника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card title="Добавление нового сотрудника" className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Пожалуйста, введите корректный email' }
              ]}
            >
              <Input placeholder="example@company.com" />
            </Form.Item>

            <Form.Item
              label="Должность"
              name="position"
              rules={[{ required: true, message: 'Пожалуйста, укажите должность' }]}
            >
              <Input placeholder="Например: Менеджер" />
            </Form.Item>

            <Form.Item
              label="Департамент"
              name="departmentId"
              rules={[{ required: true, message: 'Пожалуйста, выберите департамент' }]}
            >
              <Select placeholder="Выберите департамент">
                {departments.map(dept => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Имя"
              name="firstName"
            >
              <Input placeholder="Введите имя" />
            </Form.Item>

            <Form.Item
              label="Фамилия"
              name="lastName"
            >
              <Input placeholder="Введите фамилию" />
            </Form.Item>

            <Form.Item
              label="Телефон"
              name="phone"
              rules={[
                { pattern: /^\+?[1-9]\d{10,14}$/, message: 'Пожалуйста, введите корректный номер телефона' }
              ]}
            >
              <Input placeholder="+7XXXXXXXXXX" />
            </Form.Item>

            <Form.Item
              label="Дата рождения"
              name="birthDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Выберите дату"
                format="DD.MM.YYYY"
                locale={locale}
                disabledDate={current => current && current.isAfter(new Date())}
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-4">
                <Button onClick={() => router.push('/dashboard/employees')}>
                  Отмена
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Добавить сотрудника
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
} 