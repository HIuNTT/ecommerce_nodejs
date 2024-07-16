import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'streamifier';
import { CloudinaryResponse } from '../../interfaces/cloudinary-response';

@Injectable()
export class CloudinaryService {
    // Upload single file
    async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return await this.upload(file);
    }

    // Upload multiple files
    async uploadImages(files: Array<Express.Multer.File>): Promise<CloudinaryResponse[]> {
        const imagesToUpload = files.map(async (file) => {
            return await this.upload(file);
        });
        return await Promise.all(imagesToUpload);
    }

    async upload(file: Express.Multer.File) {
        return await new Promise<CloudinaryResponse>((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: process.env.CLOUDINARY_FOLDER_NAME },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
            createReadStream(file.buffer).pipe(upload);
        });
    }
}
