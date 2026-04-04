import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const allUsers = await this.usersService.findAll();
    // Exclude the currently logged-in user
    return allUsers.filter((user: any) => user.id !== req.user.userId);
  }
}
