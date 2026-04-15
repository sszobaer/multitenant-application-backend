import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    
    ConfigModule.forRoot({ isGlobal: true }),
    
    //PG SQL Conn
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'postgres',
    //     host: config.get<string>('DB_HOST'),
    //     port: config.get<number>('DB_PORT'),
    //     username: config.get<string>('DB_USERNAME'),
    //     password: config.get<string>('DB_PASSWORD'),
    //     database: config.get<string>('DB_NAME'),
    //     autoLoadEntities: true,
    //     synchronize: true,
    //     logging: true,
    //     extra: { 
    //       max: 10,
    //     }
    //   }),
    // }),

    //Mongo Conn
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        uri: ConfigService.get<string>("MONGO_URI"),
      }),
    }),
    TenantsModule,
    UsersModule,
    ProductsModule,
    AuthModule,
    InvitationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
