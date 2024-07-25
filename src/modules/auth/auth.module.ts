import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { AccountController } from './controllers/account.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [JwtModule.register({}), UserModule],
    controllers: [AuthController, AccountController],
    providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
