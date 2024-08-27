import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { NewsVerification } from '../news-verification/news-verification.entity';
import { Invoice } from '../invoice/invoice.entity';

@Entity('news_invoice')
export class NewsInvoice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Invoice, invoice => invoice.id)
  invoice: Invoice;
  @Column({ default: null, nullable: true })
  invoiceId: number;

  @Column({
    type: 'int',
    generated: 'increment',
    default: null,
    nullable: true,
    unique: true
  })
  sortId: number;

  @ManyToOne(() => NewsVerification, newsVerification => newsVerification.id)
  newsVerification: NewsVerification;
  @Column({ default: null, nullable: true })
  newsVerificationId: number;

  @ManyToOne(() => User, user => user.id)
  generatedBy: User;
  @Column({ default: null, nullable: true })
  generatedById: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'numeric',
    precision: 24,
    scale: 2,
    default: 0,
    nullable: true
  })
  subtotal: string;

  @Column({
    type: 'numeric',
    precision: 24,
    scale: 2,
    default: 0,
    nullable: true
  })
  unit_price: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

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
