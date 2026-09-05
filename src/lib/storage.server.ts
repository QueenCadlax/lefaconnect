import { getR2Bucket } from "./runtime.server";

export type StorageResult = {
  key: string;
  mime: string;
  size: number;
  url: string;
};

export type UploadOptions = {
  key: string;
  data: ArrayBuffer;
  mimeType: string;
  metadata?: Record<string, string>;
};

export type RetrieveOptions = {
  key: string;
};

/**
 * R2 storage abstraction for proof-of-payment files and other Lefa Connect artifacts.
 * Provides unified interface for upload, retrieve, and delete operations.
 * Errors are thrown for caller handling; no retry logic embedded.
 */
export const storage = {
  /**
   * Upload file to R2 bucket.
   * @param options Upload configuration with key, data, mimeType
   * @returns Storage metadata with public URL
   * @throws On R2 API failure, validation errors, or access issues
   */
  async upload(options: UploadOptions): Promise<StorageResult> {
    const bucket = getR2Bucket();
    const metadata: Record<string, string> = {
      "uploaded-at": new Date().toISOString(),
      ...options.metadata,
    };
    await bucket.put(options.key, options.data, {
      httpMetadata: {
        contentType: options.mimeType,
      },
      customMetadata: metadata,
    });
    return {
      key: options.key,
      mime: options.mimeType,
      size: options.data.byteLength,
      url: options.key,
    };
  },

  /**
   * Retrieve file metadata and content from R2 bucket.
   * @param options Retrieve configuration with key
   * @returns File data as ArrayBuffer, mime type, and size
   * @throws On key not found, access issues, or R2 API failure
   */
  async retrieve(
    options: RetrieveOptions,
  ): Promise<{ data: ArrayBuffer; mime: string; size: number }> {
    const bucket = getR2Bucket();
    const object = await bucket.get(options.key);
    if (!object) throw new Error(`File not found in storage: ${options.key}`);
    const mime = object.httpMetadata?.contentType || "application/octet-stream";
    const data = await object.arrayBuffer();
    return {
      data,
      mime,
      size: object.size,
    };
  },

  /**
   * Delete file from R2 bucket.
   * @param key Object key to delete
   * @throws On access issues or R2 API failure
   */
  async delete(key: string): Promise<void> {
    const bucket = getR2Bucket();
    await bucket.delete(key);
  },

  /**
   * Generate R2 object key for proof-of-payment storage.
   * Encodes membership/payment identifiers and timestamp for traceability.
   * @param membershipId Membership unique identifier
   * @param paymentId Contribution payment unique identifier
   * @param fileName Original file name (used for extension only)
   * @returns Deterministic R2 object key for storage
   */
  generatePopKey(membershipId: string, paymentId: string, fileName: string): string {
    const timestamp = Date.now();
    const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
    return `proof-of-payment/${membershipId}/${paymentId}/${timestamp}.${ext}`;
  },
};
