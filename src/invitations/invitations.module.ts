import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation, InvitationSchema } from './schema/invitation.schema';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    MongooseModule.forFeature([{
            name: Invitation.name, 
            schema: InvitationSchema,
          }
        ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
