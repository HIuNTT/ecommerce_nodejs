import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class AccountUpdateDTO {
    @IsOptional()
    @IsString()
    fullname: string;

    @IsOptional()
    @IsString()
    avatarUrl: string;
}

export class ForgotPasswordDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class ChangePasswordDTO {
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?!.*\s)[A-Za-z\d@$!%*?&]{8,30}$/)
    newPassword: string;
}
