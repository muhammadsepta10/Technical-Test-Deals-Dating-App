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
import { User } from '../user/user.entity';
import { NewsInvoice } from '../news-invoice/news-invoice.entity';

@Entity('invoice')
export class Invoice {
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

  @ManyToOne(() => User, user => user.id)
  generatedBy: User;
  @Column({ default: null, nullable: true })
  generatedById: number;

  @OneToMany(() => NewsInvoice, newsInvoice => newsInvoice.invoice)
  items: NewsInvoice[];
  item: NewsInvoice;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
    nullable: true,
    unique: true
  })
  invoice_no: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  date: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  due_date: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  from_name: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  from_address: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  to_name: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  to_address: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  rek_no: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  rek_name: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  tax: string;

  @Column({ type: 'varchar', length: 150, default: '', nullable: false })
  grand_total: string;

  @Column({
    type: 'text',
    default: '',
    nullable: true,
    comment: 'separator using ;'
  })
  tnc: string;

  @Column({ type: 'text', default: '', nullable: true })
  invoice_html: string;

  @Column({ type: 'text', default: '', nullable: true })
  invoice_pdf: string;

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
}
