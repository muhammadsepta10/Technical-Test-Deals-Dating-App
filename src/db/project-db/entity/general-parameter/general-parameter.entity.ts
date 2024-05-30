import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, BeforeInsert} from 'typeorm';
import {MasterMedia} from '../master-media/master-media.entity';
import {User} from '../user/user.entity';
import {v4 as uuidv4} from 'uuid';


export enum TypeData {
  STRING = "string",
  NUMBER = "number",
  OBJECT = "object",
  ARRAY = "array"
}


@Entity("general_parameter")
export class GeneralParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({type: 'uuid', default: () => 'uuid_generate_v4()', unique: true})
  uuid: string;

  @Column({type: "varchar", length: 255, default: null, unique: true, nullable: true})
  name: string

  @Column({type: "varchar", length: 255, default: "", nullable: true})
  value: string

  @Column({type: "enum", enum: TypeData, default: TypeData.STRING})
  type: TypeData

  @Column({type: 'smallint', width: 3, default: 0, comment: "0->inactive, 1->active", nullable: true})
  status: number;

  @Column({type: 'smallint', width: 2, default: 0, comment: "0->active, 1->inactive", nullable: true})
  is_deleted: number;

  @ManyToOne(() => MasterMedia, media => media.id)
  masterMedia: MasterMedia;
  @Column({default: null, nullable: true})
  masterMediaId: number

  @ManyToOne(() => User, user => user.id)
  createdBy: User
  @Column({default: null, nullable: true})
  createdById: number

  @ManyToOne(() => User, user => user.id)
  updatedBy: User
  @Column({default: null, nullable: true})
  updatedById: number

  @ManyToOne(() => User, user => user.id)
  deletedBy: User
  @Column({default: null, nullable: true})
  deletedById: number

  @CreateDateColumn({type: "timestamp", default: () => 'NULL', nullable: true})
  deleted_at: string;

  @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
  created_at: string;

  @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
  updated_at: string;
}