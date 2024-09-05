import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLoggerService } from '../logger/logger.service';
import { Role} from 'src/schemas/role.schema';
import { IRole } from 'src/interfaces/role.interface';


@Injectable()
export class RoleService {
    constructor(@InjectModel(Role.name) private roleModel:Model<IRole>,private readonly logger:CustomLoggerService){}

    async getAll(params:any):Promise<Array<IRole> | null>{
        // params = {...params,deleted:false};
        this.logger.log(`finding roles with params ${JSON.stringify(params)}`);
        const roles:Array<IRole> = await this.roleModel.
        find()
        .populate({
            path: 'permissions',
        })
        .exec();
        if(!roles){
            this.logger.log(`roles not found`)
            throw new BadRequestException(`Roles Not found`)
        }
        this.logger.log(`Roles found ${JSON.stringify(roles)}`)
        return roles;
    }

}
