import { PrismaClient, Role, CompanySize, IndustryType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('pass', 10);

  // Создаем системного администратора
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@staff.io' },
    update: {},
    create: {
      email: 'admin@staff.io',
      firstName: 'System',
      lastName: 'Admin',
      password: hashedPassword,
      role: Role.SYSTEM_ADMIN,
    },
  });

  // Создаем компанию
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      size: CompanySize.SMALL,
      industry: IndustryType.IT,
      email: 'company@test.com',
      phone: '+7 (999) 123-45-67',
      status: 'active',
    },
  });

  // Создаем департамент
  const department = await prisma.department.create({
    data: {
      name: 'IT Department',
      companyId: company.id,
      description: 'Main IT department',
    },
  });

  // Создаем владельца компании
  const companyOwner = await prisma.user.upsert({
    where: { email: 'owner@staff.io' },
    update: {},
    create: {
      email: 'owner@staff.io',
      firstName: 'Company',
      lastName: 'Owner',
      password: hashedPassword,
      role: Role.COMPANY_OWNER,
      employee: {
        create: {
          firstName: 'Company',
          lastName: 'Owner',
          position: 'CEO',
          departmentId: department.id,
          companyId: company.id,
        },
      },
    },
  });

  console.log({
    systemAdmin,
    company,
    department,
    companyOwner,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 