import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole, UserStatus, AuthProvider } from './modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = 'admin@vemtap.com';
  const password = 'SuperAdmin2026!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await usersService.findByEmail(email);
  if (existing) {
    existing.firstName = 'Super';
    existing.lastName = 'Admin';
    existing.password = hashedPassword;
    existing.role = UserRole.SUPER_ADMIN;
    existing.status = UserStatus.ACTIVE;
    existing.emailVerified = true;
    existing.isPasswordChanged = true;
    existing.authProvider = AuthProvider.LOCAL;
    await usersService.create(existing);
    console.log(`Updated admin user: ${email}`);
  } else {
    await usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      isPasswordChanged: true,
      authProvider: AuthProvider.LOCAL,
    });
    console.log(`Created admin user: ${email}`);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
