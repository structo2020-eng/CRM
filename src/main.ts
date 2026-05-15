import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. الحصول على إعدادات بيئة العمل
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV');

  // 2. الحماية والأمان (Security)
  app.use(helmet()); // حماية الـ Headers
  //  تفعيل الـ CORS ليقبل أي موقع (Public) مع دعم التوكنز
  // 🚀 التفعيل القاطع للـ CORS
  app.enableCors({
    origin: ['http://localhost:4200'], // صرحنا للفرونت إند المحلي بالاسم
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.use(compression()); // ضغط الاستجابات لتقليل الحجم وتسريع التطبيق

  // 3. التنسيق العالمي (Global Configuration)
  app.setGlobalPrefix('api/v1'); // إضافة بادئة لكل الروابط
  app.useGlobalInterceptors(new TransformInterceptor()); // توحيد شكل الـ JSON Response
  app.useGlobalFilters(new GlobalExceptionFilter()); // معالجة الأخطاء بشكل موحد

  // 4. تفعيل التحقق من البيانات (Validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // استبعاد أي حقول إضافية غير موجودة في الـ DTO
      forbidNonWhitelisted: true, // رمي خطأ إذا أرسل المستخدم حقولاً غريبة
      transform: true, // تحويل أنواع البيانات تلقائياً (مثل string لـ number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. توثيق الـ API عبر Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Real Estate CRM API')
    .setDescription(
      'The complete backend API documentation for the SaaS CRM system',
    )
    .setVersion('1.0')
    .addBearerAuth() // تفعيل زر الـ Token في Swagger
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // 6. تشغيل السيرفر
  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🛠️  Environment: ${nodeEnv || 'development'}`);
}

bootstrap();
