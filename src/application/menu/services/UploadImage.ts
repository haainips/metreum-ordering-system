export interface UploadImageService {
  upload(file: File): Promise<string>;
}
