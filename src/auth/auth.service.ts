import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { jwtConstants } from './constants';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(userDto: CreateUserDto) {
    const newUser = await this.usersService.getUserByEmail(userDto.email);
    if (newUser) {
      throw new HttpException('Email Already in Use', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await bcrypt.hash(userDto.password, 10);
    const user = await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });

    return this.generateTokens(user);
  }

  async login(userDto: LoginUserDto, response: Response) {
    const user = await this.validateUser(userDto);
    const tokens = await this.generateTokens(user);
    response.cookie('refreshToken', tokens.refresh_token, { httpOnly: true });
    return {
      name: user.name,
      accessToken: tokens.access_token,
    };
  }

  async logout(response: Response) {
    response.clearCookie('refreshToken');
    return 'You have been logged out';
  }

  async activate() {
    return;
  }

  async refresh() {
    return;
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: jwtConstants.accessSecret,
      }),
      this.jwtService.sign(payload, {
        expiresIn: '30d',
        secret: jwtConstants.refreshSecret,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async validateUser(userDto: LoginUserDto) {
    const user = await this.usersService.getUserByEmail(userDto.email);
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({
      message: 'Incorrect email or password',
    });
  }
}
