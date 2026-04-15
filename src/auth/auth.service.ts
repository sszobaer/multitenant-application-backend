
import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './DTOs/register.dto';
import { LoginDto } from './DTOs/login.dto';
import { Tenant } from 'src/tenants/schema/tanent.schema';
import { AcceptInviteDto } from './DTOs/accept-invite.dto';
import { Invitation } from 'src/invitations/schema/invitation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Tenant.name)
    private tenantModel: Model<Tenant>,

    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Invitation.name)
    private invitationModel: Model<Invitation>,

    private readonly jwtService: JwtService,

  ) { }

  async register(data: RegisterDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tenantExists = await this.tenantModel.findOne({ name: data.tenantName });
      if (tenantExists) {
        throw new BadRequestException('Tenant name already taken');
      }
      const existingUser = await this.userModel.findOne({
        email: data.email,
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const tenant = await this.tenantModel.create([{
        name: data.tenantName,
        isActive: true,
      }
      ], { session });

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.userModel.create(
        [
          {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            tenant: tenant[0]._id,
            role: 'admin',
          },
        ],
        { session },
      );

      //Like TypeOrm in moongose there we haven't the auto transaction we have to menually commit this
      await session.commitTransaction();
      session.endSession();

      return user[0];
    }
    catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async login(data: LoginDto) {
    const user = await this.userModel.findOne(
      { email: data.email }).populate('tenant');

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.tenant || !(user.tenant as any).isActive) {
      throw new BadRequestException('Tenant is inactive');
    }

    const payload = {
      userId: user._id,
      tenantId: (user.tenant as any)._id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async acceptInvite(token: string, dto: AcceptInviteDto) {
    const { name, password } = dto;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invitation = await this.invitationModel
        .findOne({ token })
        .populate('tenant');

      if (!invitation) {
        throw new BadRequestException('Invalid invitation token');
      }

      if (invitation.status !== 'pending') {
        throw new BadRequestException(
          'Invitation already used or expired',
        );
      }

      if (invitation.expiresAt && new Date() > invitation.expiresAt) {
        invitation.status = 'expired';
        await invitation.save({ session });

        throw new BadRequestException('Invitation has expired');
      }

      const existingUser = await this.userModel.findOne({
        email: invitation.email,
      });

      if (existingUser) {
        throw new BadRequestException(
          'User already exists with this email',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userModel.create(
        [
          {
            name,
            email: invitation.email,
            password: hashedPassword,
            tenant: (invitation.tenant as any)._id,
            role: 'user',
          },
        ],
        { session },
      );

      invitation.status = 'accepted';
      await invitation.save({ session });

      await session.commitTransaction();
      session.endSession();

      const payload = {
        userId: user[0]._id,
        tenantId: (invitation.tenant as any)._id,
        role: user[0].role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        message: 'Invitation accepted successfully',
        access_token,
        user: {
          id: user[0]._id,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
          tenantId: (invitation.tenant as any)._id,
        },
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
