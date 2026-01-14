import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from "typeorm";

/**
 * Campaign Sender Cache Entity
 * Read model for sender snapshots replicated from sender-service via events
 */
@Entity({ schema: 'campaign', name: 'campaign_sender_cache' })
export class CampaignSenderCache {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  senderId: string; // Original sender ID from sender-service

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar' })
  @Index()
  fromEmail: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  smtpHost: string;

  @Column({ type: 'int' })
  smtpPort: number;

  @Column({ type: 'varchar' })
  smtpUser: string;

  @Column({ type: 'text' })
  smtpPassword: string; // Encrypted password (same as sender-service)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  lastSyncedAt: Date; // When event was received

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
