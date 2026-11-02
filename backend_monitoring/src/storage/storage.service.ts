import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  STORAGE_CONSTANTS,
  STORAGE_ERROR_MESSAGES,
} from './storage.constants.js';

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
      STORAGE_CONSTANTS.DEFAULT_STORAGE_BUCKET;

    if (supabaseUrl && supabaseServiceRoleKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }

  async generateSignedUploadUrl(
    storageFilePath: string,
    targetBucketName?: string,
  ) {
    if (!this.supabaseClient) {
      this.logger.error(STORAGE_ERROR_MESSAGES.CLIENT_NOT_CONFIGURED);
      throw new InternalServerErrorException(
        STORAGE_ERROR_MESSAGES.CLIENT_NOT_CONFIGURED,
      );
    }

    const activeBucketName = targetBucketName || this.defaultStorageBucketName;

    const { data: uploadData, error: uploadError } =
      await this.supabaseClient.storage
        .from(activeBucketName)
        .createSignedUploadUrl(storageFilePath, { upsert: true });

    if (uploadError || !uploadData) {
      this.logger.error(
        `${STORAGE_ERROR_MESSAGES.GENERATE_UPLOAD_URL_FAILED}: ${uploadError?.message}`,
      );
      throw new InternalServerErrorException(
        `${STORAGE_ERROR_MESSAGES.GENERATE_UPLOAD_URL_FAILED}: ${uploadError?.message || 'Storage error'}`,
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
