import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserDevice } from '../user_device/user_device.entity';

@Entity('device')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Index()
  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  imei: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  devicetype: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  language: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  os: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  osVersion: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  sdkVersion: string;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  heightdips: number;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  heightpixels: number;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  scale: number;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  widthdips: number;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  widthpixels: number;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  player_id: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  firebase_id: string;

  @Column({ type: 'smallint', width: 3, default: 0, comment: '0->inactive, 1->active', nullable: true })
  status: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->active, 1->inactive', nullable: true })
  is_deleted: number;

  @OneToMany(() => UserDevice, userDevice => userDevice.device)
  userDevices: UserDevice[];

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: string;
}
