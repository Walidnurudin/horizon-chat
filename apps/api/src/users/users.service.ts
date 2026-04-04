import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createUser(username: string, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        username,
        password: passwordHash,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, username: true } });
  }
}

