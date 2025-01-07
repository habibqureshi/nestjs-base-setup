import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { IUser } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../logger/logger.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.userService.findOne({ email });
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      this.logger.log(`Password does not match`);
      throw new BadRequestException('Password does not match');
    }
    this.logger.log(`valid user`);
    return user;
  }

  async login(user: IUser): Promise<any> {
    this.logger.log(`logged in  user ${user}`);
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: getUserPermissions(user),
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      user: {
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      accessToken,
    };
  }
}

const getUserPermissions = (user: IUser) => {
  const permissions = {};
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
