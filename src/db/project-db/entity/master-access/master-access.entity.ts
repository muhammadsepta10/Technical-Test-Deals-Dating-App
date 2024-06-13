import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index
} from 'typeorm';
import { AccessDet } from '../access-det/access-det.entity';
import { MasterMedia } from '../master-media/master-media.entity';
import { User } from '../user/user.entity';
import { UserAccess } from '../user-access/user-access.entity';

@Entity('master_access')
export class MasterAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: '',
    comment: 'This is for object prop, please use camel case'
  })
  code: string;

  @Column({ type: 'smallint', width: 2, default: 1, comment: '1->enable, 0->disabled', nullable: true })
  status: number;

  @Column({ type: 'smallint', width: 2, default: 1, comment: '1->show, 0->hidden' })
  is_show: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->false, 1->true' })
  is_deleted: number;

  @OneToMany(() => UserAccess, userAccess => userAccess.masterAccess)
  userAccess: UserAccess[];

  @OneToMany(() => AccessDet, accessDet => accessDet.access)
  accessDet: AccessDet[];

  @ManyToOne(() => MasterMedia, media => media.id)
  masterMedia: MasterMedia;
  @Column({ default: null, nullable: true })
  masterMediaId: number;

  @ManyToOne(() => User, user => user.id)
  createdBy: User;
  @Column({ default: null, nullable: true })
  createdById: number;

  @ManyToOne(() => User, user => user.id)
  updatedBy: User;
  @Column({ default: null, nullable: true })
  updatedById: number;

  @ManyToOne(() => User, user => user.id)
  deletedBy: User;
  @Column({ default: null, nullable: true })
  deletedById: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  deleted_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', nullable: true })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  updated_at: string;
}
