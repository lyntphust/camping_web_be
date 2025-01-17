import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';

import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async login(userDto: LoginUserDto) {
    const { id } = await this.validateUser(userDto);
    const userInfo = await this.userRepository.findOne({ where:{id: id},relations:['role']});
    const token = await this.tokenService.generateTokens(id);
    console.log(`token: ${token}`);
    return { accessToken: token, user: userInfo };
  }

  async logout(refreshToken) {
    try {
      const { id } = await this.tokenService.verifyRefreshToken(refreshToken);

      return this.tokenService.removeRefreshToken(id);
    } catch (e) {}
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.findOneByEmail(userDto.email);

    if (candidate) return null;

    const hashedPassword = await bcrypt.hash(userDto.password, 7);
    const user = await this.userService.create({
      ...userDto,
      password: hashedPassword,
    });

    const token = await this.tokenService.generateTokens(user.id);

    return { accessToken: token, userInfo: user };
  }

  async updateAccessToken(refreshToken: string) {
    const id = await this.tokenService.isRefreshTokenValid(refreshToken);

    const accessToken = await this.tokenService.generateTokens(id);

    return accessToken;
  }

  async parseAuthorizationHeaders(authHeaders: string) {
    const tokenType = authHeaders.split(' ')[0];
    const token = authHeaders.split(' ')[1];

    if (!token || tokenType !== 'Bearer') {
      throw new UnauthorizedException('Incorrect auth headers');
    }

    const payload = this.tokenService.verifyAccessToken(token);

    return payload;
  }

  private async validateUser(userDto: LoginUserDto) {
    const user = await this.userService.findOneByEmail(userDto.email);

    if (!user) {
      throw new NotFoundException(
        `There is no user under this email ${userDto.email}`,
      );
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (passwordEquals) {
      return user;
    }

    throw new UnauthorizedException({ message: 'Incorrect password' });
  }
}
