import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Device } from '../device/device.entity';

@Entity('user_device')
export class UserDevice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @ManyToOne(() => User, user => user.id)
  user: User;
  @Column({ type: 'int', nullable: true, default: null })
  userId: number;

  @ManyToOne(() => Device, device => device.id)
  device: Device;
  @Column({ type: 'int', nullable: true, default: null })
  deviceId;

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
