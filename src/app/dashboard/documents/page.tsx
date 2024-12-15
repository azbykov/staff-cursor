'use client';

import { Table, Button, Upload, Space, message, Modal, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
  status: 'active' | 'archived';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      } else {
        message.error('Ошибка при загрузке списка документов');
      }
    } catch (error) {
      message.error('Ошибка при загрузке списка документов');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        message.success('Документ успешно загружен');
        fetchDocuments(); // Обновляем список документов
      } else {
        message.error(data.error || 'Ошибка при загрузке документа');
      }
    } catch (error) {
      message.error('Ошибка при загрузке документа');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Подтверждение удаления',
      content: 'Вы уверены, что хотите удалить этот документ?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            message.success('Докум��нт успешно удален');
            fetchDocuments(); // Обновляем список документов
          } else {
            message.error(data.error || 'Ошибка при удалении документа');
          }
        } catch (error) {
          message.error('Ошибка при удалении документа');
        }
      },
    });
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      const blob = await response.blob();
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error('Ошибка при скачивании документа');
    }
  };

  const columns: ColumnsType<Document> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: 'Загружен',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? 'Активный' : 'В архиве'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record.id, record.name)}
          >
            Скачать
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Документы</h1>
        <Upload
          customRequest={({ file }) => handleUpload(file as File)}
          showUploadList={false}
        >
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            loading={uploading}
          >
            Загрузить документ
          </Button>
        </Upload>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
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