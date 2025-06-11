import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('user_logins')
export class UserLogin extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  provider: string;
}
