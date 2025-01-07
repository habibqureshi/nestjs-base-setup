import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.schema';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity('users')
export class User {
  //use this for mongodb
  // @ObjectIdColumn()
  // id: string;

  // use this for mysql
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;

  @IsNotEmpty()
  @Column({ type: 'varchar', length: 30, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @IsEmail()
  email: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @Column({ type: 'boolean', nullable: false })
  enable: boolean;
  @Column({ type: 'boolean', nullable: false })
  deleted: boolean;
}
