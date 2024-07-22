import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { MasterBank } from '../master-bank/master-bank.entity';
import { User } from '../user/user.entity';
import { UserJournalistDoc } from '../user-journalist-doc/user-journalist-doc.entity';

@Entity('user_journalist')
export class UserJournalist {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToMany(() => UserJournalistDoc, userJournalistDoc => userJournalistDoc.userJournalist)
  UserJournalistDoc: UserJournalistDoc[];

  @ManyToOne(() => User, user => user.id)
  user: User;
  @Column({ type: 'int', nullable: true, default: null })
  userId: number;

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

  @Column({ type: 'varchar', length: 255, nullable: false })
  whatsapp_no: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @ManyToOne(() => MasterBank, bank => bank.id)
  masterBank: MasterBank;
  @Column({ default: null, nullable: true })
  masterBankId: number;

  @Column({ type: 'int', width: 20, nullable: false })
  account_no: string;

  @Column({ type: 'int', width: 30, nullable: false })
  pers_card_no: string;

  @Column({ type: 'int', width: 16, nullable: true })
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

  @Column({ type: 'varchar', length: 8, unique: true, nullable: true, comment: 'auto generated on approved' })
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
}
