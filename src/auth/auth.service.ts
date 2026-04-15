
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './DTOs/register.dto';
import { LoginDto } from './DTOs/login.dto';
import { DataSource } from 'typeorm';
import { Tenant } from 'src/tenants/schema/tanent.schema';
import { User } from 'src/users/schema/user.entity';
import { AcceptInviteDto } from './DTOs/accept-invite.dto';
import { Invitation } from 'src/invitations/schema/invitation.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existingTenant = await this.dataSource.manager.findOne(Tenant, {
      where: { name: data.tenantName },
    });

    if (existingTenant) {
      throw new BadRequestException('Tenant name already taken');
    }

    const existingUser = await this.dataSource.manager.findOne(User, {
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const tenant = manager.create(Tenant, {
        name: data.tenantName,
        isActive: true,
      });

      await manager.save(tenant);

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = manager.create(User, {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        tenant,
        role: 'admin',
      });

      const savedUser = await manager.save(user);

      return savedUser;
    });
  }

  async login(data: LoginDto) {
    const user = await this.dataSource.manager.findOne(User, {
      where: { email: data.email },
      relations: ['tenant'],
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      tenantId: user.tenant.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async acceptInvite(token: string, dto: AcceptInviteDto) {
  const {name, password } = dto;

  // 1. Find invitation
  const invitation = await this.dataSource.manager.findOne(Invitation, {
    where: { token },
    relations: ['tenant'],
  });

  if (!invitation) {
    throw new BadRequestException('Invalid invitation token');
  }

  // 2. Check status
  if (invitation.status !== 'pending') {
    throw new BadRequestException('Invitation already used or expired');
  }

  // 3. Check expiry
  if (invitation.expiresAt && new Date() > invitation.expiresAt) {
    invitation.status = 'expired';
    await this.dataSource.manager.save(invitation);

    throw new BadRequestException('Invitation has expired');
  }

  // 4. Check if user already exists
  const existingUser = await this.dataSource.manager.findOne(User, {
    where: { email: invitation.email },
  });

  if (existingUser) {
    throw new BadRequestException('User already exists with this email');
  }

  // 5. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 6. Transaction (create user + update invitation)
  const user = await this.dataSource.transaction(async (manager) => {
    const newUser = manager.create(User, {
      name,
      email: invitation.email,
      password: hashedPassword,
      tenant: invitation.tenant,
      role: 'user',
    });

    const savedUser = await manager.save(newUser);

    invitation.status = 'accepted';
    await manager.save(invitation);

    return savedUser;
  });

  // 7. Create JWT
  const payload = {
    userId: user.id,
    tenantId: user.tenant.id,
    role: user.role,
  };

  const access_token = this.jwtService.sign(payload);

  return {
    message: 'Invitation accepted successfully',
    access_token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenant.id,
    },
  };
}
}
  