import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invitation } from './schema/invitation.schema';
import { Tenant } from 'src/tenants/schema/tanent.schema';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,

    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) { }

  async sendInvite(tenantId: string, email: string): Promise<{ inviteLink: string }> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existing = await this.invitationRepo.findOne({
      where: {
        email,
        status: 'pending',
        tenant: { id: tenant.id },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A pending invitation already exists for this email in your tenant',
      );
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepo.create({
      email,
      token,
      status: 'pending',
      tenant,
      expiresAt,
    });

    await this.invitationRepo.save(invitation);

    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/auth/accept-invite?token=${token}`;

    return { inviteLink };
  }
}
