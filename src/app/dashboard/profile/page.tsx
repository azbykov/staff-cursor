interface UserProfile {
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

export default function ProfilePage() {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="firstName"
        label="Имя"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="lastName"
        label="Фамилия"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      
      {/* ... остальные поля */}
    </Form>
  );
} 