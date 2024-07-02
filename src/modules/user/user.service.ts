import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

            return user;
        } catch (error) {
            throw error;
        }
    }
}
