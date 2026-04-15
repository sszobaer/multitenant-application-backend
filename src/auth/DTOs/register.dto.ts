import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
  //   message: 'Password must contain at least one letter and one number',
  // })
  password!: string;

  @IsNotEmpty({ message: 'Tenant name is required' })
  @MaxLength(100, { message: 'Tenant name must be less than 100 characters' })
  tenantName!: string;
}