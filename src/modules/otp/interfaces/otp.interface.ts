import { Otp } from '@prisma/client';

export interface OtpInfor extends Omit<Otp, 'createdAt' | 'id' | 'expiredAt'> {}
