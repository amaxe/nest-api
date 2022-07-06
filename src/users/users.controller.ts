import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Request } from 'express';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('')
  getAllUsers(@Req() request: Request): Promise<User[]> {
    return this.userService.getAllUsers(request);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.userService.remove(id);
  }

  @Put(':id')
  update(@Body() dto: UpdateUserDto, @Param('id') id: string): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Patch(':id')
  partialUpdate(
    @Body() dto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }
}
