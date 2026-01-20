import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
<<<<<<< HEAD
import { ExpenseModule } from './expense/expense.module';
=======
>>>>>>> 4d21a1c939d9a7cfd2b655c51be1a9d82c64c44b

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 👇 ADD THIS LINE HERE
        console.log('MONGO_URI:', configService.get('MONGO_URI'));

        return {
          uri: configService.get<string>('MONGO_URI'),
        };
      },
    }),

    UsersModule,
    AuthModule,
    JwtModule,
<<<<<<< HEAD
    ExpenseModule,
=======
>>>>>>> 4d21a1c939d9a7cfd2b655c51be1a9d82c64c44b
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
