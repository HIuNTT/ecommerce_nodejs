import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?!.*\s)[A-Za-z\d@$!%*?&]{8,30}$/)
    newPassword: string;
}
