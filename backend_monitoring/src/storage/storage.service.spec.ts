import { describe, it, expect, vi } from 'vitest';
import { InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service.js';

describe('StorageService', () => {
  it('should throw InternalServerErrorException when supabaseClient is null', async () => {
    const configServiceMock = {
      get: vi.fn().mockReturnValue(null),
    } as any;

    const storageService = new StorageService(configServiceMock);

    await expect(
      storageService.generateSignedUploadUrl('proofs/test.jpg'),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should generate signed upload URL and public URL when client is configured', async () => {
    const configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
        if (key === 'SUPABASE_STORAGE_BUCKET') return 'dexa_test';
        return null;
      }),
    } as any;

    const storageService = new StorageService(configServiceMock);

    const mockCreateSignedUploadUrl = vi.fn().mockResolvedValue({
      data: {
        signedUrl: 'https://example.supabase.co/upload/sign',
        path: 'proofs/test.jpg',
        token: 'signed-token',
      },
      error: null,
    });

    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: {
        publicUrl: 'https://example.supabase.co/public/proofs/test.jpg',
      },
    });

    (storageService as any).supabaseClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUploadUrl: mockCreateSignedUploadUrl,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    };

    const result = await storageService.generateSignedUploadUrl('proofs/test.jpg');

    expect(result).toEqual({
      uploadUrl: 'https://example.supabase.co/upload/sign',
      publicUrl: 'https://example.supabase.co/public/proofs/test.jpg',
      filePath: 'proofs/test.jpg',
      token: 'signed-token',
    });
  });

  it('should throw InternalServerErrorException when Supabase returns an error', async () => {
    const configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
        return null;
      }),
    } as any;

    const storageService = new StorageService(configServiceMock);

    (storageService as any).supabaseClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUploadUrl: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Bucket not found' },
          }),
        }),
      },
    };

    await expect(
      storageService.generateSignedUploadUrl('proofs/test.jpg'),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
