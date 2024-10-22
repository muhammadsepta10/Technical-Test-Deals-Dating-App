import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('user_employee')
export class UserEmployee {
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

  @OneToOne(() => User, user => user.id)
  @JoinColumn()
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

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    default: null,
    nullable: true
  })
  employeeId: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    default: null,
    nullable: true
  })
  nip: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
    nullable: true
  })
  hp: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  employee_name: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  departement: string;

  @Column({ type: 'int', width: 11, default: null, nullable: true })
  departementId: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  section: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  position: string;

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
