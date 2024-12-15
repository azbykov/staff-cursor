'use client';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Statistic, Row, Col } from 'antd';
import { TeamOutlined, FileOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <PageContainer
      title="Панель управления"
      subTitle="Обзор основных показателей"
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <ProCard>
            <Statistic 
              title="Всего сотрудников" 
              value={42} 
              prefix={<TeamOutlined />} 
            />
          </ProCard>
        </Col>
        <Col span={8}>
          <ProCard>
            <Statistic 
              title="Активные документы" 
              value={156} 
              prefix={<FileOutlined />} 
            />
          </ProCard>
        </Col>
        <Col span={8}>
          <ProCard>
            <Statistic 
              title="Заявки на отпуск" 
              value={8} 
              prefix={<ClockCircleOutlined />} 
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={16}>
          <ProCard
            title="Последние действия"
            headerBordered
          >
            <p>• Иван Петров обновил документы</p>
            <p>• Мария Сидорова запросила отпуск</p>
            <p>• Новый сотрудник добавлен в систему</p>
            <p>• Обновлен статус онбординга</p>
          </ProCard>
        </Col>
        <Col span={8}>
          <ProCard
            title="Быстрые действия"
            headerBordered
          >
            <p>➕ Добавить сотрудника</p>
            <p>📄 Создать документ</p>
            <p>📅 Запланировать встречу</p>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
} 