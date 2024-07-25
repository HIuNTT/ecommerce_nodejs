import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService } from '../../shared/mail/mail.service';
import { generate } from 'otp-generator';
import { OtpInfor } from './interfaces';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { join } from 'path';
import fs from 'fs';
import { BodyEmail, VerifyEmail, VerifyPhone } from './dto/verify-otp.dto';
import { successResponse } from 'src/helpers/response.helper';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { isEmpty } from 'lodash';

@Injectable()
export class OtpService {
    constructor(
        private readonly mailService: MailService,
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly userService: UserService,
    ) {}

    async sendEmailOtp(payload: BodyEmail) {
        // Kiểm tra xem email đã tồn tại chưa
        const user = await this.userService.findUserByEmail(payload.email);

        if (user) {
            throw new BadRequestException('Email existed');
        }

        const otp = (await this.findOneOtpAvailable(payload.email)) || this.generateOtp(6);

        if (!(await this.findOneOtpAvailable(payload.email))) {
            await this.setOtp({
                verifyType: payload.email,
                code: otp,
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
                code: payload.code,
                verifyType: verifyData,
                expiredAt: {
                    gte: dayjs().toISOString(),
                },
            },
        });

        if (!data) {
            throw new BadRequestException('The OTP code is incorrect or has expired');
        } else {
            await this.prisma.$transaction([
                this.prisma.otp.delete({
                    where: {
                        id: data.id,
                    },
                }),
                this.prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data:
                        payload instanceof VerifyEmail
                            ? { isVerifiedEmail: true, email: payload.email }
                            : { isVerifiedPhone: true, phone: payload.phone },
                }),
            ]);
        }
    }

    async setOtp(data: OtpInfor) {
        // Lưu otp vào database
        const expiredAt = dayjs().add(15, 'minutes').toISOString();
        await this.prisma.otp.create({
            data: {
                ...data,
                expiredAt,
            },
        });
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
    async findOneOtpAvailable(verifyData: string): Promise<string | null> {
        const data = await this.prisma.otp.findFirst({
            where: {
                verifyType: verifyData,
                expiredAt: {
                    gte: dayjs().toISOString(),
                },
            },
        });

        return data ? data.code : null;
    }
}
