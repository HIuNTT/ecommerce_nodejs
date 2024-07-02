import { PickType } from '@nestjs/mapped-types';
import { RegisterDTO } from './register.dto';

export class LoginDTO extends PickType(RegisterDTO, ['username']) {
    reqPassword: string;
}
