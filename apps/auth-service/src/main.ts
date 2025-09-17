import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ENV,
  RABBITMQ_COMMON_OPTIONS,
  RABBITMQ_SERVICES,
} from '@packages/common';
import * as sentry from '@sentry/node';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './modules/app.module';

const configureSwagger = (app: INestApplication): void => {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Backend Service')
    .setDescription('Backend Service APIs')
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
  const logger: Logger = new Logger();

  const app: INestApplication = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  // Enable cookie parsing
  app.use(cookieParser());

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

  // RabbitMQ microservice setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      ...RABBITMQ_COMMON_OPTIONS,
      urls: [configService.get<string>('rabbitmq.connection_uri')],
      queue: RABBITMQ_SERVICES.AUTH_SERVICE,
    },
  });
  await app.startAllMicroservices();

  // use rpc exception filter
  logger.log('RabbitMQ microservices started successfully');

  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port, () => {
    logger.log(`🚀 Auth Service running on port ${port}`);
    logger.log(
      `📚 API Documentation available at http://localhost:${port}/docs`,
    );
  });
};

bootstrap();
