import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { FlashSaleService } from '~/modules/flash-sale/flash-sale.service';
import { UserService } from '~/modules/user/user.service';
import { MailService } from '../mail/mail.service';
import { join } from 'path';
import fs from 'fs';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    constructor(
        private readonly config: ConfigService,
        private readonly flashSaleService: FlashSaleService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async checkUpcomingFlashSale() {
        this.logger.log('---> Start checking the flash sale start time');

        const timeSendNoti = this.config.get('TIME_SEND_NOTIFICATION');
        const flashSale = await this.flashSaleService.findUpcomingFlashSale(timeSendNoti);
        if (flashSale) {
            const users = await this.userService.findAllUsersVerifiedEmail();

            const template = 'send-email-noti-flash-sale.hbs';
            const path = join(__dirname, 'src/templates', template);
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

            this.logger.log(`---> Sent email to ${userCount} users`);
        }
    }
}
