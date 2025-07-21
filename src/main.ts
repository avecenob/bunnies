import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import 'dayjs/locale/id';
import * as dayjsModule from 'dayjs';
const dayjs = (dayjsModule as any).default || dayjsModule;

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.use(methodOverride('_method'));
  app.use(cookieParser());

  // set views and assets
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  app.setBaseViewsDir('views');

  // register partials
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  hbs.registerPartials(join(__dirname, '..', 'views/layouts'));

  // register helpers
  hbs.registerHelper('increment', function (value: any) {
    return parseInt(value) + 1;
  });
  hbs.registerHelper('includes', function (array: any[], value: any) {
    return Array.isArray(array) && array.includes(value);
  });
  hbs.registerHelper('capitalize', function (str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  hbs.registerHelper('eq', function (a: any, b: any) {
    return a === b;
  });
  hbs.registerHelper('gt', (a: number, b: number) => a > b);
  hbs.registerHelper('json', function (context: any) {
    return new hbs.SafeString(
      JSON.stringify(context)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027'),
    );
  });
  hbs.registerHelper('formatDate', function (date: Date) {
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
