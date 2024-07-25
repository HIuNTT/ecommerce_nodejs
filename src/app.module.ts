import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './shared/mail/mail.module';
import { OtpModule } from './modules/otp/otp.module';
import { CategoryModule } from './modules/category/category.module';
import { UploadModule } from './modules/upload/upload.module';
import { SharedModule } from './shared/shared.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './filters/any-exception.filter';
import { ItemModule } from './modules/item/item.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { FlashSaleModule } from './modules/flash-sale/flash-sale.module';
import { OrderModule } from './modules/order/order.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRootAsync({
            useFactory: () => ({
                errorMessage: 'Hoạt động hiện tại quá thường xuyên, vui lòng thử lại sau!',
                throttlers: [
                    {
                        ttl: seconds(10),
                        limit: 7,
                    },
                ],
            }),
        }),
        AuthModule,
        UserModule,
        MailModule,
        OtpModule,
        CategoryModule,
        UploadModule,
        SharedModule,
        ItemModule,
        VoucherModule,
        FlashSaleModule,
        OrderModule,
    ],
    providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },

        { provide: APP_INTERCEPTOR, useFactory: () => new TimeoutInterceptor(20 * 1000) },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
