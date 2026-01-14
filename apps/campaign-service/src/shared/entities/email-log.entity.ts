import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index, Unique } from "typeorm";

export enum EmailLogStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

@Entity({ schema: 'campaign', name: 'email_logs' })
@Unique(['campaignId', 'recipientEmail'])
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  jobId: string; // BullMQ job ID

  @Column({ type: 'uuid' })
  @Index()
  campaignId: string;

  @Column({ type: 'uuid' })
  @Index()
  recipientId: string;

  @Column({ type: 'varchar' })
  recipientEmail: string;

  @Column({
    type: 'enum',
    enum: EmailLogStatus,
    default: EmailLogStatus.PENDING
  })
  @Index()
  status: EmailLogStatus;

  @Column({ type: 'varchar', nullable: true })
  providerMessageId: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
