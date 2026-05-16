import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import * as path from 'path';

// 1. استيراد الموديولات الخاصة بنا (القديمة والجديدة)
import { AuthModule } from './modules/auth/auth.module';
import { LeadModule } from './modules/lead/lead.module';
import { BranchModule } from './modules/branch/branch.module';
import { ProjectModule } from './modules/project/project.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { HealthModule } from './modules/health/health.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

// 🚀 الموديولات التي أضفناها لحل مشكلة 404
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { DealModule } from './modules/deal/deal.module';
import { PropertyModule } from './modules/property/property.module';
import { MatchModule } from './modules/match/match.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { VisitModule } from './modules/visit/visit.module';
import { ActivityModule } from './modules/activity/activity.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// استيراد الحراس (Guards) لتطبيقهم على مستوى النظام
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 1. حماية متغيرات البيئة والتأكد من وجودها
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
        CLOUD_NAME: Joi.string().required(),
        CLOUD_API_KEY: Joi.string().required(),
        CLOUD_API_SECRET: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASS: Joi.string().required(),
      }),
    }),

    // 2. الاتصال بقاعدة البيانات
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    // 3. حماية السيرفر من هجمات الـ DDoS (Rate Limiting)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // خلال دقيقة واحدة
        limit: 100, // أقصى عدد طلبات هو 100 طلب من نفس الـ IP
      },
    ]),

    // 4. إعدادات الإيميل (Mailer)
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT', 587),
          secure: false,
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Real Estate CRM" <${config.get('SMTP_USER')}>`,
        },
      }),
    }),

    // 5. التخزين المؤقت (Caching)
    CacheModule.register({
      isGlobal: true,
    }),

    // 6. تعدد اللغات (i18n)
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        // استخدم join مع __dirname لضمان الوصول للمجلد سواء كنا في src أو dist
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
    }),

    // 7. تفعيل المهام المجدولة (Cron Jobs)
    ScheduleModule.forRoot(),

    // 8.  تسجيل كل الموديولات ليتعرف عليها السيرفر
    AuthModule,
    LeadModule,
    BranchModule,
    ProjectModule,
    TasksModule,
    HealthModule,
    CloudinaryModule,
    CompanyModule, // <-- تم الإضافة
    UserModule, // <-- تم الإضافة
    DealModule, // <-- تم الإضافة
    PropertyModule, // <-- تم الإضافة
    MatchModule, // <-- تم الإضافة
    NotificationModule, // <-- تم الإضافة
    PaymentModule, // <-- تم الإضافة
    VisitModule, // <-- تم الإضافة
    ActivityModule, // <-- تم الإضافة
    AnalyticsModule, // <-- تم الإضافة
  ],
  providers: [
    // تطبيق حماية JWT و Roles على كل مسارات النظام افتراضياً
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
