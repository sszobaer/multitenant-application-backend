import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './DTOs/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async createUser(data: CreateUserDto) {
    const exists = await this.findByEmail(data.email);

    if (exists) {
    throw new BadRequestException('Email already exists');
  }
    return this.userModel.create(data);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }
}