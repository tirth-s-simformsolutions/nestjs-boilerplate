import { NestFactory } from '@nestjs/core';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import * as sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENV } from './common/constants';
import { AppModule } from './app/app.module';

const configureSwagger = (app: INestApplication): void => {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Backend Service')
    .setDescription('Backend Service APIs')
    .addBearerAuth(
      {
        type: 'http',
        description: 'This is Bearer auth',
        scheme: 'bearer',
        bearerFormat: 'Token',
      },
      'Authorization',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Backend Service',
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  });
};

const bootstrap = async (): Promise<void> => {
  const nestLogger: Logger = new Logger();

  const app: INestApplication = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  // setup cors
  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    optionsSuccessStatus: HttpStatus.OK,
    credentials: true,
  });

  // setup helmet
  app.use(helmet());

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // set global prefix
  app.setGlobalPrefix('api');

  // setup api versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // swagger setup
  if (configService.get<string>('app.env') !== ENV.PRODUCTION) {
    configureSwagger(app);
  }

  // sentry setup
  const dsn = configService.get<string | null>('app.sentryDsn');
  const env = configService.get<string>('app.env');
  if (dsn && (env === ENV.PRODUCTION || env === ENV.STAGING)) {
    sentry.init({
      dsn: dsn,
      tracesSampleRate: 0.8,
      environment: env,
    });
  }

  const port = configService.get<number>('app.port');

  await app.listen(port, () => {
    nestLogger.log(`🚀 Service running on port ${port}`);
  });
};

bootstrap();
