import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'streamifier';
import { UploadRes } from '~/interfaces';

@Injectable()
export class CloudinaryService {
    async upload(file: Express.Multer.File) {
        return await new Promise<UploadRes>((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: process.env.CLOUDINARY_FOLDER_NAME },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({ imageUrl: result.secure_url });
                },
            );
            createReadStream(file.buffer).pipe(upload);
        });
    }
}
