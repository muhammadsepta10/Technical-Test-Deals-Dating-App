import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { MasterBank } from '../master-bank/master-bank.entity';
import { User } from '../user/user.entity';
import { UserJournalistDoc } from '../user-journalist-doc/user-journalist-doc.entity';
import { MasterInvalidReason } from '../master-invalid-reason/master-invalid-reason.entity';

@Entity('user_journalist')
export class UserJournalist {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'int',
    generated: 'increment',
    default: null,
    nullable: true,
    unique: true
  })
  sortId: number;

  @OneToMany(() => UserJournalistDoc, userJournalistDoc => userJournalistDoc.userJournalist)
  UserJournalistDoc: UserJournalistDoc[];

  @OneToOne(() => User, user => user.id)
  @JoinColumn()
  user: User;
  @Column({ type: 'int', nullable: true, default: null })
  userId: number;

  @ManyToOne(() => User, user => user.id)
  verifiedBy: User;
  @Column({ default: null, nullable: true })
  verifiedById: number;

  @ManyToOne(() => User, user => user.id)
  approvedBy: User;
  @Column({ default: null, nullable: true })
  approvedById: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 2->on verif, 1->active',
    nullable: true
  })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  media_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  whatsapp_no: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  address: string;

  @ManyToOne(() => MasterBank, bank => bank.id)
  masterBank: MasterBank;
  @Column({ default: null, nullable: true })
  masterBankId: number;

  @ManyToOne(() => MasterInvalidReason, invalidReason => invalidReason.id)
  masterInvalidReason: MasterInvalidReason;
  @Column({ default: null, nullable: true })
  masterInvalidReasonId: number;

  @Column({ type: 'varchar', length: 20, nullable: false, default: '' })
  account_no: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: '' })
  bank_account_name: string;

  @Column({ type: 'varchar', length: 30, nullable: false, default: '' })
  pers_card_no: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  npwp: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  instagram_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  facebook_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  x_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  tiktok_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  youtube_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  website_link: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  podcast_link: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
    comment: 'auto generated on approved'
  })
  journalist_id: string;

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

  @Column({ type: 'timestamp', default: null, nullable: true })
  verified_at: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  approved_at: string;
}
