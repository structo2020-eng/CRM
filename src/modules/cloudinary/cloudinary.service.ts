import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as Multer from 'multer';
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // 1. محاولة القراءة من ConfigService أو مباشرة من النظام كخطة بديلة
    const cloudName =
      this.configService.get<string>('CLOUD_NAME') || process.env.CLOUD_NAME;
    const apiKey =
      this.configService.get<string>('CLOUD_API_KEY') ||
      process.env.CLOUD_API_KEY;
    const apiSecret =
      this.configService.get<string>('CLOUD_API_SECRET') ||
      process.env.CLOUD_API_SECRET;

    // 2. طباعة القيم في الـ Terminal للتأكد (أشعة سينية 🕵️‍♂️)
    console.log('====================================');
    console.log('☁️ CLOUDINARY CONFIG CHECK:');
    console.log('CLOUD_NAME:', cloudName || '❌ MISSING');
    console.log('CLOUD_API_KEY:', apiKey ? '✅ FOUND' : '❌ MISSING');
    console.log('====================================');

    // 3. حقن المفاتيح
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'crm_files',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
