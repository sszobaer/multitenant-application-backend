import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './schema/tanent.schema';
import { CreateTenantDto } from './DTOs/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  async createTenant(data: CreateTenantDto) {
    const exists = await this.tenantRepo.findOne({
      where: {
        name : data.name
      }
    });

    if(exists) throw new BadRequestException("Tenant name already taken");
    const tenant = await this.tenantRepo.create({
      name: data.name
    });

    return this.tenantRepo.save(tenant);
  }

  findById(id: string) {
    return this.tenantRepo.findOne({ where: { id } });
  }

  deactivateTenant(id: string) {
    return this.tenantRepo.update(id, { isActive: false });
  }
}