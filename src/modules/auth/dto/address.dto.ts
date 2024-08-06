import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class OrderAddressDTO {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsPhoneNumber('VN')
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

export class GetAddressDTO {
    id: string;
    userId: string;
    fullname: string;
    phone: string;
    province: string;
    district: string;
    commune: string;
    address: string;
    isDefault: number;
    createdAt: Date;
    updatedAt: Date;
}

export class CreateAddressDTO {
    @ApiProperty({ description: 'Tên đầy đủ của người mua' })
    @IsString()
    fullname: string;

    @ApiProperty({ description: 'Số điện thoại người mua để gọi khi giao hàng đến nơi' })
    @IsPhoneNumber('VN')
    phone: string;

    @ApiProperty({ description: 'Tỉnh/Thành phố', example: 'Hà Nội' })
    @IsString()
    province: string;

    @ApiProperty({ description: 'Quận/Huyện', example: 'Cầu Giấy' })
    @IsString()
    district: string;

    @ApiProperty({ description: 'Phường/Xã', example: 'Nghĩa Đô' })
    @IsString()
    commune: string;

    @ApiProperty({ description: 'Địa chỉ bổ sung', example: 'Số 1, ngõ 1 xóm Đông, thôn Bến Trung' })
    @IsString()
    address: string;
}

export class UpdateAddressDTO extends CreateAddressDTO {
    @ApiProperty({ description: 'Mã địa chỉ' })
    @IsString()
    id: string;
}

export class DeleteAddressDTO extends PickType(UpdateAddressDTO, ['id'] as const) {}

export class SetDefaultAddressDTO extends DeleteAddressDTO {}
