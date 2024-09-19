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
import { JwtStrategy } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
    private readonly jwtService: JwtService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  async validateUser(email: string, password: string): Promise<IUser> {
    const user: IUser = await this.userService.findOne({ email });
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      this.logger.log(`Password does not match`);
      throw new BadRequestException('Password does not match');
    }
    this.logger.log(`valid user`);
    return user;
  }

  async login(user: IUser): Promise<any> {
    // const payload = { email: user.email, id: user.id };
    const payload = { email: user.email, id: user, roles: user.roles };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(
      `validating token  ${JSON.stringify(await this.jwtStrategy.validate(payload))}`,
    );
    return {
      user: {
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  //   async register(user: RegisterRequestDto): Promise<AccessToken> {
  //     const existingUser = await this.usersService.findOneByEmail(user.email);
  //     if (existingUser) {
  //       throw new BadRequestException('email already exists');
  //     }
  //     const hashedPassword = await bcrypt.hash(user.password, 10);
  //     const newUser: User = { ...user, password: hashedPassword };
  //     await this.usersService.create(newUser);
  //     return this.login(newUser);
  //   }
}
