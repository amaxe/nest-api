import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async getAllUsers(request: Request): Promise<User[]> {
    try {
      const data = await this.jwtService.verify(request.cookies.refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      if (!data) {
        throw new UnauthorizedException();
      }
      return await this.userModel.find().exec();
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    return await this.userModel.create(dto);
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
