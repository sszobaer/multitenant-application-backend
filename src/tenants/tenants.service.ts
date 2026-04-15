import { BadRequestException, Injectable } from '@nestjs/common';
import { Tenant } from './schema/tanent.schema';
import { CreateTenantDto } from './DTOs/create-tenant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name)
    private tenantModel: Model<Tenant>,
  ) { }

  async createTenant(data: CreateTenantDto) {
    const exists = await this.tenantModel.findById({
      name: data.name
    });

    if (exists) throw new BadRequestException("Tenant name already taken");
    const tenant = await this.tenantModel.create({
      name: data.name,
      isActive: true
    });

    return tenant;
  }

  findById(id: string) {
    return this.tenantModel.findById(id);
  }

  deactivateTenant(id: string) {
    return this.tenantModel.findByIdAndUpdate(id,
      { isActive: false },
      { new: true }
    );
  }
}