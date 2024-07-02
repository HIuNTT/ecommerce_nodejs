import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail, { Options } from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
    private transporter: Mail;

    constructor(private readonly config: ConfigService) {
        this.transporter = createTransport(
            {
                host: config.get('MAIL_HOST'),
                secure: false,
                auth: {
                    user: config.get('MAIL_USER'),
                    pass: config.get('MAIL_PASSWORD'),
                },
            },
            {
                from: `MyShop <${config.get('MAIL_FROM')}>`,
            },
        );
    }

    async sendMail(options: Options) {
        return await this.transporter
            .sendMail(options)
            .then(() => {
                return {
                    message: `Send to email ${options.to} successfully`,
                    statusCode: HttpStatus.OK,
                };
            })
            .catch(() => {
                return {
                    message: 'Cannot send to email',
                    statusCode: HttpStatus.BAD_REQUEST,
                };
            });
    }
}
