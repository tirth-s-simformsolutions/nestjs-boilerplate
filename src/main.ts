import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { logger } from './common/services';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isProduction } from './common/utils';
import { ENV } from './common/constants';

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
  if (!isProduction(configService)) {
    configureSwagger(app);
  }

  // sentry setup
  const dsn = configService.get('app.sentryDsn') as string;
  const env = configService.get('app.env') as string;
  if (dsn && (env === ENV.PRODUCTION || env === ENV.STAGING)) {
    sentry.init({
      dsn: dsn,
      tracesSampleRate: 0.8,
      environment: env,
    });
  }

  app.use(
    morgan(':method :url :status :res[content-length] :response-time ms', {
      stream: { write: (string) => logger.info(string.replace('\n', '')) },
      skip: (req) => req.url.includes('healthCheck'),
    }),
  );

  await app.listen(configService.get('app.port') as string, () => {
    nestLogger.log(
      `🚀 service running on port ${configService.get('app.port') as string}`,
    );
  });
};

bootstrap();
