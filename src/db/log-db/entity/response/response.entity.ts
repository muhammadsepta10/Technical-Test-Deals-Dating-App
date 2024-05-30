import { Column, CreateDateColumn, Entity, Generated, Index, ObjectIdColumn, UpdateDateColumn} from "typeorm";

@Entity({name: "response"})
export class ResponseEntity {
    @ObjectIdColumn()
    @Generated()
    @Index()
    _id: string;

    @Column({default: ""})
    requestId: string

    @Column({default: ""})
    responeBody: string

    @Column({default: ""})
    responeTime: string

    @CreateDateColumn()
    createdAt: Date = new Date()

    @UpdateDateColumn()
    updatedAt: Date
}