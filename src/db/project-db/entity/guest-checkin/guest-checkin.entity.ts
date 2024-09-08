import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { GuestMeetingParticipant } from '../guest-meeting-participant/guest-meeting-participant.entity';

@Entity('guest_checkin')
export class GuestCheckin {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @ManyToOne(() => GuestMeetingParticipant, guestMeetingParticipant => guestMeetingParticipant.id)
  participant: GuestMeetingParticipant;
  @Column({ type: 'int', default: null, nullable: true })
  participantId: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '1->checkin, 2->checkout'
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
  checkin_time: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  checkout_time: string;

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
