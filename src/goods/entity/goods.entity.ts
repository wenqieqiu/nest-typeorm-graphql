import { Entity, Column, ObjectID, ObjectIdColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Goods {
  @PrimaryGeneratedColumn()
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Column({ unique: true })
  readonly name: string;

  @Column()
  readonly price: number;

  @Column()
  readonly count: number;

  @Column()
  readonly remark: string;
}
