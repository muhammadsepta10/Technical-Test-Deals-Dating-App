import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('master_script')
export class MasterScript {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  description: string;

  @Column({ type: 'text', default: '', nullable: true })
  html_template: string;

  @Column({ type: 'varchar', unique: true, default: '', nullable: true, comment: 'Variable Name' })
  name: string;

  @Column({ type: 'text', default: null, nullable: true })
  banner: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  title: string;

  @Column({ type: 'text', default: null, nullable: true })
  body: string;

  @Column({ type: 'int', default: 1, nullable: true })
  status: number;

  @Column({ type: 'int', default: 1, nullable: true })
  sort: string;

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
