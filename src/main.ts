import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestInterceptor } from './config/interceptors/bad-request.interceptor';
import { generateOpenApi } from '@ts-rest/open-api';
import { api } from './contracts';
import { ValidationErrorInterceptor } from './config/interceptors/validation-error.interceptor';
import { NotFoundErrorInterceptor } from './config/interceptors/not-found.interceptor';
// import helmet  from 'helmet'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new BadRequestInterceptor(),
    new ValidationErrorInterceptor(),
    new NotFoundErrorInterceptor(),
  );
  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('App')
    .setDescription('API')
    .setVersion('1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh',
        description: 'Enter refresh token',
        in: 'header',
      },
      'Refresh-auth',
    )
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        name: 'Basic',
        description: 'Enter basic auth credentials',
        in: 'header',
      },
      'Basic-auth',
    )
    .build();

  const document = generateOpenApi(api, config, {
    setOperationId: true,
    operationMapper: (operation, appRoute) => {
      // Check if it's a refresh token route

      if (appRoute.path.includes('/auth/refresh')) {
        return {
          ...operation,
          security: [{ 'Refresh-auth': [] }],
        };
      }
      // Check if it's a public route based on path patterns
      const isPublicRoute =
        appRoute.path.includes('/auth/login') ||
        appRoute.path.includes('/public/') ||
        (appRoute.method === 'GET' && appRoute.path.includes('/health'));

      if (isPublicRoute) {
        return {
          ...operation,
          security: [{ 'Basic-auth': [] }],
        };
      }

      // Default to JWT auth for protected routes
      return {
        ...operation,
        security: [{ 'JWT-auth': [] }],
      };
    },
  });

  // Configure Swagger UI options
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    jsonDocumentUrl: 'swagger.json',
  });

  await app.listen(3000);
}
bootstrap();
