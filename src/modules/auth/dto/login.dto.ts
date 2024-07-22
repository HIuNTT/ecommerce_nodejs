import { PickType } from '@nestjs/mapped-types';
import { RegisterDTO } from './register.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO extends PickType(RegisterDTO, ['username']) {
    @IsNotEmpty()
    @IsString()
    reqPassword: string;
}
