import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_STORAGE_BUCKET } from './storage.constants.js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabaseClient: SupabaseClient | null = null;
  private readonly defaultStorageBucketName: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.defaultStorageBucketName =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ||
      DEFAULT_STORAGE_BUCKET;

    if (supabaseUrl && supabaseServiceRoleKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }

  async generateSignedUploadUrl(
    storageFilePath: string,
    targetBucketName?: string,
  ) {
    if (!this.supabaseClient) {
      this.logger.error('Supabase storage client is not configured');
      throw new InternalServerErrorException('Storage service is not configured');
    }

    const activeBucketName = targetBucketName || this.defaultStorageBucketName;

    const { data: uploadData, error: uploadError } =
      await this.supabaseClient.storage
        .from(activeBucketName)
        .createSignedUploadUrl(storageFilePath, { upsert: true });

    if (uploadError || !uploadData) {
      this.logger.error(
        `Failed to create signed upload URL: ${uploadError?.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to generate upload URL: ${uploadError?.message || 'Storage error'}`,
      );
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from(activeBucketName)
      .getPublicUrl(storageFilePath);

    return {
      uploadUrl: uploadData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      filePath: uploadData.path,
      token: uploadData.token,
    };
  }
}
