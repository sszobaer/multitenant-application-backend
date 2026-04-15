import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Invitation } from './schema/invitation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from 'src/tenants/schema/tanent.schema';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: Model<Invitation>,

    @InjectModel(Tenant.name)
    private tanentModel: Model<Tenant>
  ) { }

  async sendInvite(tenantId: string, email: string): Promise<{ inviteLink: string }> {
    const tenant = await this.tanentModel.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existing = await this.invitationModel.findOne({
      where: {
        email,
        status: 'pending',
        tenant: tenant._id,
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

    const invitation = await this.invitationModel.create({
      email,
      token,
      status: 'pending',
      tenant: tenant._id,
      expiresAt,
    });

    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/auth/accept-invite?token=${token}`;

    return { inviteLink };
  }
}
