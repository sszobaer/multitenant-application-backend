import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation, InvitationSchema } from './schema/invitation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/tenants/schema/tanent.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{
            name: Invitation.name, 
            schema: InvitationSchema,
          }, 
          {
            name: Tenant.name,
            schema: TenantSchema
          }
        ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [MongooseModule],
})
export class InvitationsModule {}
