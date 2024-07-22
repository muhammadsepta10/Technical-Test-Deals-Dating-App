import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { MasterNewsCategory } from '../master-news-category/master-news-category.entity';

@Entity('news_verification')
export class NewsVerification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.id)
  verifiedBy: User;
  @Column({ default: null, nullable: true })
  verifiedById: number;

  @ManyToOne(() => User, user => user.id)
  approvedBy: User;
  @Column({ default: null, nullable: true })
  approvedById: number;

  @ManyToOne(() => MasterNewsCategory, masterNewsCategory => masterNewsCategory.id)
  masterNewsCategory: MasterNewsCategory;
  @Column({ default: null, nullable: true })
  masterNewsCategoryId: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  title: string;

  @Column({ type: 'text', default: '', nullable: true })
  desc: string;

  @Column({ type: 'text', default: '', nullable: true })
  url: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 2->approved, 1->proccess',
    nullable: true
  })
  status: number;

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
