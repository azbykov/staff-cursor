'use client';

import { Form, Input, Select, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/store/registrationStore';
import { CompanySize, IndustryType } from '@prisma/client';

export default function RegisterStep1() {
  const router = useRouter();
  const { companyData, setCompanyData } = useRegistrationStore();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setCompanyData(values);
    router.push('/auth/register/step2');
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold mb-6">
        Регистрация компании
      </h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={companyData}
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Название компании"
          rules={[{ required: true, message: 'Введите название компании' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="industry"
          label="Отрасль"
          rules={[{ required: true, message: 'Выберите отрасль' }]}
        >
          <Select>
            {Object.values(IndustryType).map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="size"
          label="Размер компании"
          rules={[{ required: true, message: 'Выберите размер компании' }]}
        >
          <Select>
            <Select.Option value={CompanySize.MICRO}>До 10 сотрудников</Select.Option>
            <Select.Option value={CompanySize.SMALL}>До 30 сотрудников</Select.Option>
            <Select.Option value={CompanySize.MEDIUM}>До 50 сотрудников</Select.Option>
            <Select.Option value={CompanySize.LARGE}>Больше 50 сотрудников</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="phone" label="Телефон">
          <Input />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-between">
            <Button onClick={() => router.push('/auth/login')}>
              Назад
            </Button>
            <Button type="primary" htmlType="submit">
              Далее
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
} 