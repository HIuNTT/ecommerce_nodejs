import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class RegisterDTO {
    @ApiProperty({ description: 'Tên đăng nhập', example: 'admin' })
    @IsString()
    username: string;

    @ApiProperty({ description: 'Họ và tên' })
    @IsString()
    fullname: string;

    @ApiProperty({ description: 'Email' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'Số điện thoại' })
    @IsOptional()
    @IsPhoneNumber('VN')
    phone?: string;

    @ApiProperty({ description: 'Mật khẩu', example: 'Admin123456*' })
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
    password: string; // Add password field for authentication
}
