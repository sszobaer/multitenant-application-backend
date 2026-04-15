import { Module } from '@nestjs/common';
import { TenantService } from './tenants.service';
import { Tenant, TenantSchema } from './schema/tanent.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{
        name: Tenant.name, 
        schema: TenantSchema,
      }
    ])
  ],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantsModule {}
