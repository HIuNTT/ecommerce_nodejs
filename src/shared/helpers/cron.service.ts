import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { FlashSaleService } from '~/modules/flash-sale/flash-sale.service';
import { UserService } from '~/modules/user/user.service';
import { MailService } from '../mail/mail.service';
import { join } from 'path';
import fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly flashSaleService: FlashSaleService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async sendNotiFlashSale() {
        this.logger.log('--> Start checking the flash sale start time');

        const timeSendNoti = this.config.get('TIME_SEND_NOTIFICATION');
        const flashSale = await this.flashSaleService.findUpcomingFlashSale(timeSendNoti);
        if (flashSale) {
            const users = await this.userService.findAllUsersVerifiedEmail();

            const template = 'send-email-noti-flash-sale.hbs';
            const path = join(__dirname, 'src/templates', template);
            console.log(path);
            let contentFile = fs.readFileSync(path, 'utf-8');

            let userCount = 0;
            await Promise.all(
                users.map(async (user) => {
                    const subject = 'MyShop: Thông báo Flash Sale';
                    contentFile = contentFile.replace('{{name}}', user.fullname);
                    contentFile = contentFile.replace(
                        '{{startTime}}',
                        dayjs(flashSale.startTime).format('DD/MM/YYYY HH:mm:ss'),
                    );
                    contentFile = contentFile.replace(
                        '{{endTime}}',
                        dayjs(flashSale.endTime).format('DD/MM/YYYY HH:mm:ss'),
                    );

                    await this.mailService.sendMail({
                        to: user.email,
                        subject,
                        html: contentFile,
                    });

                    this.logger.debug(`Send email to ${user.email}`);

                    userCount += 1;
                }),
            );

            this.logger.log(`--> Sent email to ${userCount} users`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredOtp() {
        this.logger.log('--> Start scanning the board and remove expired OTP');

        const expiredOtps = await this.prisma.otp.findMany({
            where: {
                expiredAt: {
                    lte: dayjs().toISOString(),
                },
            },
        });

        let deleteCount = 0;
        await Promise.all(
            expiredOtps.map(async (otp) => {
                const { code, createdAt } = otp;

                await this.prisma.otp.delete({
                    where: {
                        id: otp.id,
                    },
                });

                this.logger.debug(`Deleted OTP code: ${code} created at ${createdAt}`);

                deleteCount += 1;
            }),
        );

        this.logger.log(`--> Deleted ${deleteCount} expired OTP`);
    }
}
