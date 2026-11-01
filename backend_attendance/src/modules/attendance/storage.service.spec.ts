import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service.js';

describe('StorageService', () => {
  let configServiceMock: any;

  beforeEach(() => {
    configServiceMock = {
      get: vi.fn(),
    };
  });

  it('should throw InternalServerErrorException if client is not configured', async () => {
    configServiceMock.get.mockReturnValue(undefined);

    const storageService = new StorageService(configServiceMock);

    await expect(
      storageService.generateSignedUploadUrl('proofs/test.jpg'),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should generate signed upload URL and public URL on success', async () => {
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
      if (key === 'SUPABASE_STORAGE_BUCKET') return 'test-bucket';
      return undefined;
    });

    const storageService = new StorageService(configServiceMock);

    const mockStorageClient = {
      from: vi.fn().mockReturnValue({
        createSignedUploadUrl: vi.fn().mockResolvedValue({
          data: {
            signedUrl: 'https://test.supabase.co/upload-sign',
            path: 'proofs/test.jpg',
            token: 'test-token',
          },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: {
            publicUrl: 'https://test.supabase.co/public/proofs/test.jpg',
          },
        }),
      }),
    };

    (storageService as any).supabaseClient = {
      storage: mockStorageClient,
    };

    const result = await storageService.generateSignedUploadUrl('proofs/test.jpg');

    expect(result).toEqual({
      uploadUrl: 'https://test.supabase.co/upload-sign',
      publicUrl: 'https://test.supabase.co/public/proofs/test.jpg',
      filePath: 'proofs/test.jpg',
      token: 'test-token',
    });
  });

  it('should throw InternalServerErrorException if Supabase returns an error', async () => {
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
      return undefined;
    });

    const storageService = new StorageService(configServiceMock);

    const mockStorageClient = {
      from: vi.fn().mockReturnValue({
        createSignedUploadUrl: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Bucket not found' },
        }),
      }),
    };

    (storageService as any).supabaseClient = {
      storage: mockStorageClient,
    };

    await expect(
      storageService.generateSignedUploadUrl('proofs/test.jpg'),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
