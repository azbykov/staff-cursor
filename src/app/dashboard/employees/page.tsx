'use client';

import { Table, Button, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  user: {
    email: string;
  };
  department: {
    name: string;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      
      if (response.status === 403) {
        message.error('У вас нет доступа к этой странице');
        router.push('/dashboard');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      } else {
        message.error(data.error || 'Ошибка при загрузке списка сотрудников');
      }
    } catch (error) {
      message.error('Ошибка при загрузке списка сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Employee> = [
    {
      title: 'Имя',
      key: 'name',
      render: (record: Employee) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Департамент',
      dataIndex: ['department', 'name'],
      key: 'department',
    },
    {
      title: 'Email',
      dataIndex: 'user',
      key: 'email',
      render: (user) => user.email
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/employees/${record.id}`)}>
            Просмотр
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/employees/${record.id}/edit`)}>
            Редактировать
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Сотрудники</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => router.push('/dashboard/employees/add')}
        >
          Добавить сотрудника
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </div>
  );
} 