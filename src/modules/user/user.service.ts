import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Address, User } from '@prisma/client';
import { isEmpty } from 'lodash';
import { AccountInfo } from './dto/user.dto';
import {
    AccountUpdateDTO,
    ChangePasswordDTO,
    CreateAddressDTO,
    DeleteAddressDTO,
    GetAddressDTO,
    SetDefaultAddressDTO,
    UpdateAddressDTO,
} from '../auth/dto';
import { UpdatePasswordDTO } from './dto/password.dto';
import { compare, hash } from '~/helpers/encryption.helper';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getAccountInfo(userId: string): Promise<AccountInfo> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                isActived: true,
            },
            select: {
                username: true,
                fullname: true,
                email: true,
                phone: true,
                avatarUrl: true,
            },
        });

        if (isEmpty(user)) {
            throw new BadRequestException(`User not found`);
        }

        if (isEmpty(user.email)) {
            delete user.email;
        }

        if (isEmpty(user.phone)) {
            delete user.phone;
        }

        if (isEmpty(user.avatarUrl)) {
            delete user.avatarUrl;
        }

        return user;
    }

    async updateAccountInfo(userId: string, info: AccountUpdateDTO): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                fullname: info.fullname || {},
                avatarUrl: info.avatarUrl || {},
            },
        });
    }

    async updatePassword(userId: string, body: UpdatePasswordDTO): Promise<void> {
        const user = await this.findUserById(userId);
        if (!user) {
            throw new BadRequestException(`User not found`);
        }

        if (!(await compare(body.oldPassword, user.password))) {
            throw new BadRequestException('Old password is incorrect');
        }

        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: await hash(body.newPassword),
            },
        });
    }

    // Thiết lập lại mật khẩu khi quên mật khẩu
    async changePassword(body: ChangePasswordDTO) {
        const { email, token, newPassword } = body;

        const user = await this.findUserByVerifiedEmail(email);
        if (!user) {
            throw new BadRequestException('Invalid link or expired');
        }
        const tokenData = await this.prisma.token.findFirst({
            where: {
                token,
                email,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        if (!tokenData) {
            throw new BadRequestException('Invalid link or expired');
        }

        if (await compare(newPassword, user.password)) {
            throw new BadRequestException('New password is same as old password');
        }

        await this.prisma.$transaction([
            this.prisma.token.delete({
                where: {
                    id: tokenData.id,
                },
            }),
            this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password: await hash(newPassword),
                },
            }),
        ]);
    }

    //Kiểm tra xem email đã được dùng chưa (trong trường hợp lúc đăng ký không điền email)
    // async checkEmailAvailable(payload: BodyEmail) {
    //     const user = await this.prisma.user.findFirst({
    //         where: {
    //             email: payload.email,
    //         },
    //     });

    //     if (user) {
    //         return new BadRequestException('Email has been used');
    //     }
    // }

    async findUserById(userId: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
    }

    async findUserByUsername(username: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({
            where: {
                username,
            },
        });
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return this.prisma.user.findFirst({
            where: {
                email: email,
            },
        });
    }

    async findUserByPhone(phone: string): Promise<User | undefined> {
        return this.prisma.user.findFirst({
            where: {
                phone,
            },
        });
    }

    async findUserByVerifiedEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
                isActived: true,
                isVerifiedEmail: true,
            },
        });
    }

    async findAllUsersVerifiedEmail() {
        return this.prisma.user.findMany({
            where: {
                isActived: true,
                role: 'USER',
                email: { not: null },
                isVerifiedEmail: true,
            },
        });
    }

    //Quản lý địa chỉ của người dùng

    async getListAddress(userId: string): Promise<GetAddressDTO[]> {
        return await this.prisma.address.findMany({
            where: {
                userId,
            },
            orderBy: {
                isDefault: 'desc',
                createdAt: 'desc',
            },
        });
    }

    async createAddress(payload: CreateAddressDTO, userId: string): Promise<void> {
        const addressUser = await this.prisma.address.findFirst({
            where: {
                userId,
            },
        });

        const isDefault = addressUser ? 0 : 1;

        await this.prisma.address.create({
            data: {
                ...payload,
                userId,
                isDefault,
            },
        });
    }

    async updateAddress(userId: string, payload: UpdateAddressDTO): Promise<void> {
        const { id, ...data } = payload;
        const address = await this.findOneAddressUser(userId, id);

        if (!address) {
            throw new BadRequestException('Address not found');
        }

        await this.prisma.address.update({
            where: {
                id,
                userId,
            },
            data,
        });
    }

    async deleteAddress(userId: string, deleteBody: DeleteAddressDTO): Promise<void> {
        const { id } = deleteBody;

        const address = await this.findOneAddressUser(userId, id);

        if (!address) {
            throw new BadRequestException('Address not found');
        }

        await this.prisma.address.delete({
            where: {
                id,
                userId,
            },
        });
    }

    async setDefaultAddress(userId: string, setDefaultBody: SetDefaultAddressDTO): Promise<void> {
        const { id } = setDefaultBody;

        const address = await this.findOneAddressUser(userId, id);

        if (!address) {
            throw new BadRequestException('Address not found');
        }

        await this.prisma.address.update({
            where: {
                id,
                userId,
            },
            data: {
                isDefault: 1,
            },
        });
    }

    async findOneAddressUser(userId: string, addressId: string): Promise<Address> {
        return this.prisma.address.findUnique({
            where: {
                id: addressId,
                userId,
            },
        });
    }
}
