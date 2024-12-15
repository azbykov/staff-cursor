'use client';

import { Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  status: string;
  employees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
    }
  }>;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      const result = await response.json();
      
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Количество сотрудников',
      key: 'employeesCount',
      render: (record: Company) => record.employees.length
    },
    {
      title: 'Email владельца',
      key: 'ownerEmail',
      render: (record: Company) => {
        const owner = record.employees.find(emp => emp.user.email);
        return owner?.user.email || 'Не указан';
      }
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Компании</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/companies/add')}
        >
          Добавить компанию
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={companies}
        columns={columns}
        rowKey="id"
      />
    </div>
  );
} 