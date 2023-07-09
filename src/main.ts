import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import * as fs from 'fs';

async function bootstrap() {
  const checkPrivateKey = fs.existsSync('/etc/ssl/private/private.key');
  const checkCertificate = fs.existsSync('/etc/ssl/certs/certificate.crt');
  const app = await NestFactory.create(AppModule, {
    httpsOptions:
      checkPrivateKey && checkCertificate
        ? {
            key: readFileSync('/etc/ssl/private/private.key'),
            cert: readFileSync('/etc/ssl/certs/certificate.crt'),
          }
        : undefined,
  });
  await app.listen(11000);
}
bootstrap();
