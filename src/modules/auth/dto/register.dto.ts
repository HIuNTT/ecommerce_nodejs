import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsPhoneNumber('VN')
    phone?: string;

    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
    password: string; // Add password field for authentication
}
