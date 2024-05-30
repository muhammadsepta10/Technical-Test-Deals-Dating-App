import { Column, CreateDateColumn, Entity, Generated, Index, ObjectIdColumn, UpdateDateColumn} from "typeorm";

@Entity({name: "request"})
export class RequestEntity {
    @ObjectIdColumn()
    @Generated()
    @Index()
    _id: string;

    @Column({default: "{}"})
    body: string = ""

    @Column({default: "00"})
    ip: string = ""

    @Column({default: "/"})
    path: string = ""

    @Column({default: "-"})
    param: string = ""

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}