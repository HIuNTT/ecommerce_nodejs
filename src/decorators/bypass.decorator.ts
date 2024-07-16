import { SetMetadata } from '@nestjs/common';

/**
 * Thêm decorator @Bypass() để bỏ qua việc trả về response tùy chỉnh từ interceptor
 */
export const BYPASS_KEY = '__bypass_key__';
export const Bypass = () => SetMetadata(BYPASS_KEY, true);
