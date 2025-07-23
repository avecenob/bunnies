import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import 'dayjs/locale/id';
import * as dayjsModule from 'dayjs';
const dayjs = (dayjsModule as any).default || dayjsModule;

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // set views and assets
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');
  app.setBaseViewsDir('views');

  // register partials
  hbs.registerPartials(join(__dirname + '/../views/partials'));

  // register helpers
  hbs.registerHelper('increment', (value: any) => {
    return parseInt(value) + 1;
  });
  hbs.registerHelper('includes', (array: any[], value: any) => {
    return Array.isArray(array) && array.includes(value);
  });
  hbs.registerHelper('capitalize', (str: string) => {
    if (typeof str !== 'string') return '';
    if (str.length === 0) return str;
    if (str.length === 1) return str.toUpperCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  hbs.registerHelper('eq', (a: any, b: any) => {
    return a === b;
  });
  hbs.registerHelper('gt', (a: number, b: number) => a > b);
  hbs.registerHelper('json', (context: any) => {
    return new hbs.SafeString(
      JSON.stringify(context)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027'),
    );
  });
  hbs.registerHelper('formatDate', (date: Date) => {
    return dayjs(date).locale('id').format('D MMMM YYYY, HH:mm');
  });

  const PORT = process.env.PORT ?? 3000;
  const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

  await app.listen(PORT, HOST, () => {});

  const server = app.getHttpServer();
  const addressInfo = server.address();

  const host =
    HOST === 'localhost'
      ? HOST
      : typeof addressInfo === 'string'
        ? addressInfo
        : addressInfo?.address;
  const port = typeof addressInfo === 'string' ? '' : addressInfo?.port;

  console.log(`App is runing on ${host}:${port}`);
}

bootstrap();
