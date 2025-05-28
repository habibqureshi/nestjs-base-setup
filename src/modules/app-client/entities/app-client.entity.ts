import { BaseEntity } from 'src/common/base-entity';
import { Entity, Column } from 'typeorm';

@Entity('app_clients')
export class AppClient extends BaseEntity {
  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
