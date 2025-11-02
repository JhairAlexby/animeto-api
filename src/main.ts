import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configuración de CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuración de validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Animeto API')
    .setDescription('API para red social de manga y anime')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Autenticación', 'Endpoints para registro y login')
    .addTag('Usuarios', 'Gestión de perfiles de usuario')
    .addTag('Posts', 'Gestión de publicaciones')
    .addTag('Comentarios', 'Sistema de comentarios anidados')
    .addTag('Reacciones', 'Sistema de likes y dislikes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Configuración del puerto
  const port = configService.get('PORT') || 3000;
  
  await app.listen(port);
  
  logger.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  logger.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
