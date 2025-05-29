import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../logger/logger.service';
import { APP_CONFIGS } from 'src/config/app.config';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { TokenResponseSchema } from 'src/common/types/auth.types';
import { ForbiddenErrorInterceptor } from 'src/config/interceptors/forbidden-request.interceptor';
import { RedisService } from '../redis/redis.service';
import { AppClientService } from '../app-client/app-client.service';
import { UnauthorizedErrorInterceptor } from 'src/config/interceptors/unauthorized.interceptor';
import { IJwtPayload } from 'src/interfaces/jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly appClientService: AppClientService,
  ) {}

  async validateUser(email: string, password: string): Promise<IUser> {
    const user: User | null = await this.userService.findOneOrNull({
      where: {
        email,
      },
      relations: ['roles', 'roles.permissions'],
      select: {
        password: true,
        id: true,
        name: true,
        email: true,
        roles: {
          id: true,
          name: true,
          permissions: { id: true, name: true, url: true },
        },
      },
    });
    if (!user) {
      this.logger.log('User not found for ' + email);
      throw new BadRequestException('User not found!');
    }
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      this.logger.log(`Password does not match for ` + email);
      throw new BadRequestException('Password does not match');
    }
    this.logger.log(`valid user`);
    const parsedUser: IUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions: getUserPermissions(user),
    };
    await this.redisService.set<IUser>(`USER:${user.id}`, parsedUser);
    return parsedUser;
  }

  async login(user?: IUser): Promise<TokenResponseSchema> {
    if (!user) {
      this.logger.log('user not found');
      throw new BadRequestException('User not found!');
    }
    this.logger.log(`logged in  user ${user.id}`);
    const payload: IJwtPayload = {
      sub: user.id,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: APP_CONFIGS.JWT.TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: APP_CONFIGS.JWT.REFRESH_SECRET,
        expiresIn: APP_CONFIGS.JWT.REFRESH_EXPIRY,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async refresh(user: IUser): Promise<TokenResponseSchema> {
    const payload: IJwtPayload = {
      sub: user.id,
    };
    const [accessToken, refreshTokenGenerated] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: APP_CONFIGS.JWT.REFRESH_SECRET,
        expiresIn: APP_CONFIGS.JWT.REFRESH_EXPIRY,
      }),
    ]);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken: refreshTokenGenerated,
    };
  }

  async findUserById(id: number) {
    const cachedUser: IUser = await this.redisService.get<IUser>(`USER:${id}`);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.userService.findOneOrNull({
      where: { id },
      relations: ['roles', 'roles.permissions'],
      select: {
        id: true,
        email: true,
        name: true,
        roles: {
          id: true,
          name: true,
          permissions: { id: true, name: true, url: true },
        },
      },
    });
    if (!user) {
      this.logger.log(`Invalid user id ${id}`);
      throw new ForbiddenErrorInterceptor(['Invalid user!']);
    }
    const parsedUser: IUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions: getUserPermissions(user),
    };
    return parsedUser;
  }

  async validateClient(username: string, password: string) {
    this.logger.log('checking client');
    const client = await this.appClientService.findOneOrNull({
      where: { clientId: username },
    });
    if (!client || client.deleted) {
      this.logger.log(`invalid client ${username}`);
      throw new UnauthorizedErrorInterceptor(['Invalid client!']);
    }

    const isValidSecret = await bcrypt.compare(password, client.clientSecret);
    if (!isValidSecret) {
      this.logger.log('invalid password!');
      throw new UnauthorizedErrorInterceptor(['Invalid client!']);
    }
    return true;
  }
}

const getUserPermissions = (
  user: User,
): Record<
  string,
  { roleId: number; roleName: string; permission: Permission }
> => {
  const permissions: Record<
    string,
    { roleId: number; roleName: string; permission: Permission }
  > = {};
  user.roles.map((role) => {
    role.permissions.map((permission) => {
      permissions[permission.url] = {
        roleId: role.id,
        roleName: role.name,
        permission,
      };
    });
  });
  return permissions;
};
