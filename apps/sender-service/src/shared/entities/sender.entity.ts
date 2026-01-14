import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from "typeorm";

export enum SenderProvider {
  SMTP = 'smtp',
}

@Entity({ schema: 'sender', name: 'senders' })
export class Sender {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column()
  name: string;

  @Column()
  fromEmail: string;

  @Column({
    type: 'enum',
    enum: SenderProvider,
    default: SenderProvider.SMTP
  })
  provider: SenderProvider;

  @Column()
  smtpHost: string;

  @Column({ type: 'int' })
  smtpPort: number;

  @Column()
  smtpUser: string;

  @Column({ type: 'text' })
  smtpPassword: string; // Encrypted

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
