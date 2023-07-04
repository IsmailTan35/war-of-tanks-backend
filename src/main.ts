import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: false
      ? {
          key: readFileSync('/etc/ssl/private/private.key'),
          cert: readFileSync('/etc/ssl/certs/certificate.crt'),
        }
      : undefined,
  });
  await app.listen(11000);
}
bootstrap();
