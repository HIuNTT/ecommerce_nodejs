import { FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';

export const fileValidators = [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
];
