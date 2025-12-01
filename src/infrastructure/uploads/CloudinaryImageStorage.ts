import type { UploadImageService } from '@/application/menu/services/UploadImage';

export class CloudinaryImageStorage implements UploadImageService {
  constructor(private cfg: { cloudName: string; preset: string }) {}
  async upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', this.cfg.preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cfg.cloudName}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? 'UPLOAD_FAILED');
    return data.secure_url as string;
  }
}
