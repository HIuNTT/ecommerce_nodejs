import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class GetAddressDTO {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsPhoneNumber('VI')
    phone: string;

    @IsString()
    @IsNotEmpty()
    province: string;

    @IsString()
    @IsNotEmpty()
    district: string;

    @IsNotEmpty()
    @IsString()
    commune: string;

    @IsNotEmpty()
    @IsString()
    address: string;
}
