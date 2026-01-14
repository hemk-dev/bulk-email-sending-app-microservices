import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique, UpdateDateColumn } from "typeorm";

@Entity({ schema: 'recipient', name: 'recipients' })
@Unique(['campaignId', 'email'])
export class Recipient {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  campaignId: string;

  @Column({ type: 'varchar'})
  @Index()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
