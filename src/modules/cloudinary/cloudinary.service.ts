import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as Multer from 'multer';
const toStream = require('buffer-to-stream');
@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'crm_files',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' }, // auto ليدعم الـ PDF والصور
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      // تحويل الـ Buffer الموجود في الذاكرة إلى Stream ورفعه
      toStream(file.buffer).pipe(upload);
    });
  }
}
