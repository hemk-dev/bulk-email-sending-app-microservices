import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from "typeorm";

/**
 * Campaign Recipient Entity
 * Read model for recipient snapshots replicated from recipient-service via events
 */
@Entity({ schema: 'campaign', name: 'campaign_recipients' })
export class CampaignRecipient {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string; // Maps to recipient-service recipient ID

  @Column({ type: 'uuid' })
  @Index()
  campaignId: string;

  @Column({ type: 'varchar' })
  @Index()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamp' })
  lastSyncedAt: Date; // When event was received

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
