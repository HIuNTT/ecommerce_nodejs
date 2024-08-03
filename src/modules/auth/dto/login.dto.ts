import { ApiProperty, PickType } from '@nestjs/swagger';
import { RegisterDTO } from './register.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO extends PickType(RegisterDTO, ['username']) {
    @ApiProperty({ description: 'Mật khẩu', example: 'Admin123456*' })
    @IsNotEmpty()
    @IsString()
    reqPassword: string;
}
