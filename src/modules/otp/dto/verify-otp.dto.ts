import { IsEmail, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class BodyEmail {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class BodyPhone {
    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: string;
}

export class VerifyEmail {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Length(6)
    code: string;
}

export class VerifyPhone {
    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: string;

    @IsNotEmpty()
    @Length(6)
    code: string;
}
