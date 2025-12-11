import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import session = require('express-session');
import * as cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS first
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'supersecret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );

  // Listen last
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
