import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('guest_meeting')
export class GuestMeeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'nama meeting'
  })
  meeting_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'lokasi meeting'
  })
  location: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'Pic'
  })
  pic_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'information contact pic (no hp / email)'
  })
  pic_contact: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'tujuan bertamu'
  })
  purpose: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'qr code to refered to website'
  })
  qr_code: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '1-> internal, 2-> external'
  })
  type: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '0-> belum berlangsung, 1-> sedang berlangsung, 2-< berakhir'
  })
  status: number;

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

  @Column({ type: 'timestamp', default: null, nullable: true })
  start_time: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  end_time: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  deleted_at: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  updated_at: string;
}
