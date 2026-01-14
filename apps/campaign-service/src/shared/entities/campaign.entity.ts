import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from "typeorm";

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

@Entity({ schema: 'campaign', name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'text' })
  bodyText: string;

  @Column()
  senderEmail: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT
  })
  @Index()
  status: CampaignStatus;

  @Column({ type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @Column({ type: 'int', default: 0 })
  failedCount: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
