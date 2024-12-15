import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, BuildOutlined } from '@ant-design/icons';

export default async function AdminDashboard() {
  // TODO: Получить реальные данные из БД
  const stats = {
    companies: 10,
    admins: 25
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Компании"
              value={stats.companies}
              prefix={<BuildOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Администраторы"
              value={stats.admins}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 