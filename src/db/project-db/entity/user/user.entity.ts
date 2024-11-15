import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserDevice } from '../user_device/user_device.entity';
import { UserAccess } from '../user-access/user-access.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    default: '',
    unique: true,
    type: 'varchar',
    length: 255,
    nullable: true
  })
  username: string;

  @Column({
    default: '',
    unique: true,
    type: 'varchar',
    length: 255,
    nullable: true
  })
  email: string;

  @Column({ default: '', type: 'varchar', length: 255, nullable: false })
  photo: string;

  @Column({ default: '', type: 'varchar', length: 255 })
  password: string;

  @Column({ default: '', type: 'varchar', length: 255 })
  name: string;

  @Column({
    default: 0,
    type: 'smallint',
    width: 2,
    comment: '0-> free account, 2-> premium account'
  })
  is_premium: number;

  @Column({
    default: 1,
    type: 'smallint',
    width: 2,
    comment: '1-> active, 2-> inactive'
  })
  status: number;

  @OneToMany(() => UserDevice, userDevice => userDevice.user)
  userDevices: UserDevice[];

  @OneToMany(() => UserAccess, userAccess => userAccess.user)
  userAccess: UserAccess[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updated_at: string;
}
