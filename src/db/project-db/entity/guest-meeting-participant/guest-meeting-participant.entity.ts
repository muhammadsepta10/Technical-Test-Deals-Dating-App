import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { GuestMeeting } from '../guest-meeting/guest-meeting.entity';

@Entity('guest_meeting_participant')
export class GuestMeetingParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
    nullable: true,
    comment: 'No Undangan',
    unique: true
  })
  invitation_no: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'nama tamu'
  })
  guest_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'email tamu'
  })
  guest_email: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'nama instansi'
  })
  instance_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'nama instansi'
  })
  depratement_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true,
    comment: 'wa no tamu'
  })
  wa_no: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '0->unchecking, 1->checkin'
  })
  status: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '0->unconfirm, 1->confirm'
  })
  confirmation: number;

  @ManyToOne(() => GuestMeeting, guestMeeting => guestMeeting.id)
  meeting: GuestMeeting;
  @Column({ default: null, nullable: true })
  meetingId: number;

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
