import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ast_users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt: Date;

    @Column({ name: 'account_type', type: 'int', nullable: false })
    account_type: number;

    @Column({ name: 'role', type: 'int', nullable: false })
    role: number;

    @Column({ type: 'int', nullable: true })
    status: number;
}
