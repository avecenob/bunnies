import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // set views and assets
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  // register partials
  // Handlebars.registerPartial(join(__dirname, '..', 'views', 'partials'))
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
