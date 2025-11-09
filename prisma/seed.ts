// prisma/seed.ts
import 'dotenv/config';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const name = process.env.ADMIN_NAME ?? 'Owner';
  const email = (process.env.ADMIN_EMAIL ?? 'owner@metreum.local').toLowerCase();
  const passwordPlain = process.env.ADMIN_PASSWORD ?? 'ChangeMe_123!';

  const existing = await prisma.user.findFirst({
    where: { role: { in: ['SUPERADMIN', 'ADMIN'] } },
  });
  if (existing) {
    console.log('Admin sudah ada, skip.');
    return;
  }

  const passwordHash = await hash(passwordPlain, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: passwordHash, role: 'SUPERADMIN' },
    create: { name, email, password: passwordHash, role: 'SUPERADMIN' },
    select: { id: true, email: true, role: true },
  });

  console.log('Admin dibuat/diperbarui:', user);
}

main().finally(() => prisma.$disconnect());
