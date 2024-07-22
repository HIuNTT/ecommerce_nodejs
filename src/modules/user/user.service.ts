import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { errorResponse, successResponse } from '../../helpers/response.helper';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { BodyEmail } from '../otp/dto/verify-otp.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getProfile(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    username: true,
                    fullname: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                },
            });

            if (!user) {
                throw new BadRequestException(`User not found`);
            }

            if (!user.email) {
                delete user.email;
            }

            if (!user.phone) {
                delete user.phone;
            }

            if (!user.avatarUrl) {
                delete user.avatarUrl;
            }

            return new successResponse(user, HttpStatus.OK, 'success');
        } catch (error) {
            throw error;
        }
    }

    //Kiểm tra xem email đã được dùng chưa (trong trường hợp lúc đăng ký không điền email)
    async checkEmailAvailable(payload: BodyEmail) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (user) {
            return new errorResponse(HttpStatus.BAD_REQUEST, 'Email already used');
        } else {
            return new successResponse(null, HttpStatus.OK, 'Email available');
        }
    }

    async findUserById(userId: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({
            where: {
                id: userId,
                isActived: true,
            },
        });
    }
}
