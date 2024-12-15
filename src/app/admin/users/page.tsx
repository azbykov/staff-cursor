'use client';

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Role } from '@/types/prisma';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  employee?: {
    position: string;
    department: {
      name: string;
    };
  };
}

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Имя',
      key: 'fullName',
      render: (record: User) => `${record.firstName || ''} ${record.lastName || ''}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Компания',
      dataIndex: ['employee', 'department', 'name'],
      key: 'company',
    },
    {
      title: 'Должность',
      dataIndex: ['employee', 'position'],
      key: 'position',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => {
        const roleMap = {
          SYSTEM_ADMIN: 'Системный администратор',
          COMPANY_OWNER: 'Владелец компании',
          COMPANY_MANAGER: 'Менеджер компании',
          EMPLOYEE: 'Сотрудник'
        };
        return roleMap[role];
      }
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Активен' : 'Неактивен'}
        </Tag>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <div className="space-x-2">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Деактивировать пол��зователя?"
            description="Пользователь потеряет доступ к системе"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Деактивировать
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      firstName: user.employee?.firstName,
      lastName: user.employee?.lastName,
      position: user.employee?.position,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      message.success('Пользователь деактивирован');
    } catch (error) {
      message.error('Ошибка при деактивации пользователя');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      message.success(
        editingUser 
          ? 'Пользователь обновлен' 
          : 'Пользователь добавлен'
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      message.error('Ошибка при сохранении пользователя');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Добавить пользователя
        </Button>
      </div>

      <Table columns={columns} dataSource={[]} rowKey="id" />

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
            name="position"
            label="Должность"
            rules={[{ required: true, message: 'Введите должность' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select>
              <Select.Option value="COMPANY_OWNER">Владелец компании</Select.Option>
              <Select.Option value="COMPANY_MANAGER">Менеджер компании</Select.Option>
              <Select.Option value="EMPLOYEE">Сотрудник</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Сохранить' : 'Добавить'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 