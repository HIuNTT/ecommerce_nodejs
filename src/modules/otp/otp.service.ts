import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService } from '../../shared/mail/mail.service';
import { generate } from 'otp-generator';
import { OtpInfor } from './interfaces';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs';
import { BodyEmail, VerifyEmail, VerifyPhone } from './dto/verify-otp.dto';
import { successResponse } from 'src/helpers/response.helper';

@Injectable()
export class OtpService {
    constructor(
        private readonly mailService: MailService,
        private readonly prisma: PrismaService,
    ) {}

    async sendEmailOtp(payload: BodyEmail, userId: string) {
        const otp = (await this.checkAvailable(payload.email, userId)) || this.generateOtp(6);

        if (!(await this.checkAvailable(payload.email, userId))) {
            await this.setOtp({
                verifyType: payload.email,
                code: otp,
                userId,
            });
        }

        const template = 'send-email-otp.hbs';
        const path = join(__dirname, 'src/templates', template); //path.join(path1, path2, path3,...) => kết hợp tất cả các tham số là đường dẫn với nhau sau đó chuẩn hóa đường dẫn kết quả tạo ra
        let contentFile = fs.readFileSync(path, 'utf-8');
        contentFile = contentFile.replace('{{otp}}', otp);

        return await this.mailService.sendMail({
            to: payload.email,
            subject: 'MyShop: Mã OTP để xác minh tài khoản',
            html: contentFile,
        });
    }

    // Xác thực mã OTP gửi đến email hoặc phone
    async verifyOtp(payload: VerifyEmail | VerifyPhone, userId: string) {
        const verifyData = payload instanceof VerifyEmail ? payload.email : payload.phone;

        // Kiểm tra xem mã OTP hết hạn chưa, và có khớp với OTP client gửi lên không?
        const data = await this.prisma.otp.findFirst({
            where: {
                userId,
                code: payload.code,
                verifyType: verifyData,
                createdAt: {
                    gte: new Date(Date.now() - 15 * 60 * 1000),
                },
            },
        });

        if (!data) {
            throw new BadRequestException('The OTP code is incorrect or has expired');
        } else {
            await this.prisma.otp.delete({
                where: {
                    id: data.id,
                },
            });
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: payload instanceof VerifyEmail ? { isVerifiedEmail: true } : { isVerifiedPhone: true },
            });

            return new successResponse(null, HttpStatus.OK, 'Verify successfuly');
        }
    }

    async setOtp(data: OtpInfor) {
        try {
            const { userId, ...otherData } = data;

            // Save to database
            await this.prisma.otp.create({
                data: {
                    ...otherData,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        } catch (error) {
            throw error;
        }
    }

    // Sinh otp với độ dài length
    generateOtp(length: number) {
        return generate(length, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
    }

    // Kiểm tra xem email hoặc phone đã được lưu ở Otps chưa (đã gửi otp đến email or phone hay chưa)
    async checkAvailable(verifyData: string, userId: string) {
        const data = await this.prisma.otp.findFirst({
            where: {
                verifyType: verifyData,
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 15 * 60 * 1000),
                },
            },
        });

        return data ? data.code : null;
    }
}
