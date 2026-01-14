import csv from 'csv-parser';
import { Readable } from 'stream';
import { CreateRecipientDto } from '../dto/recipient.dto';
import { RecipientValidator } from '../dto/recipient.dto';

export interface CSVParseResult {
  recipients: CreateRecipientDto[];
  errors: string[];
}

/**
 * Parse CSV data and convert to recipient DTOs
 * Expected CSV format:
 * - Headers: email, name (optional), metadata (optional JSON string)
 * - Email is required, name and metadata are optional
 */
export async function parseCSV(csvData: string | Buffer, campaignId: string): Promise<CSVParseResult> {
  const recipients: CreateRecipientDto[] = [];
  const errors: string[] = [];
  let rowNumber = 0;

  return new Promise((resolve, reject) => {
    const stream = Readable.from(csvData.toString());
    const results: any[] = [];

    stream
      .pipe(csv())
      .on('data', (row: any) => {
        rowNumber++;
        try {
          // Extract email (required)
          const email = row.email || row.Email || row.EMAIL;
          if (!email) {
            errors.push(`Row ${rowNumber}: email is required`);
            return;
          }

          // Extract name (optional)
          const name = row.name || row.Name || row.NAME || null;

          // Extract metadata (optional, should be JSON string)
          let metadata: Record<string, any> | undefined = undefined;
          if (row.metadata || row.Metadata || row.METADATA) {
            try {
              const metadataStr = row.metadata || row.Metadata || row.METADATA;
              if (metadataStr && metadataStr.trim()) {
                metadata = JSON.parse(metadataStr);
                if (typeof metadata !== 'object' || Array.isArray(metadata)) {
                  errors.push(`Row ${rowNumber}: metadata must be a valid JSON object`);
                  metadata = undefined;
                }
              }
            } catch (parseError) {
              errors.push(`Row ${rowNumber}: invalid JSON in metadata field`);
            }
          }

          // Validate email format
          if (!RecipientValidator.validateEmail(email)) {
            errors.push(`Row ${rowNumber}: invalid email format: ${email}`);
            return;
          }

          // Create recipient DTO
          const recipient: CreateRecipientDto = {
            campaignId,
            email: email.trim().toLowerCase(),
            name: name ? name.trim() : undefined,
            metadata,
          };

          results.push(recipient);
        } catch (error: any) {
          errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
        }
      })
      .on('end', () => {
        recipients.push(...results);
        resolve({ recipients, errors });
      })
      .on('error', (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      });
  });
}
