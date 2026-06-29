import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private api = inject(ApiService);

  async uploadProviderImage(file: File, folder: 'profile' | 'gallery'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await firstValueFrom(
      this.api.upload<{ url: string }>(`/uploads/${folder}`, formData)
    );
    return res.url;
  }

  async deleteGalleryImage(url: string): Promise<void> {
    await firstValueFrom(this.api.delete('/uploads/gallery', { url }));
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP and GIF images are allowed.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 5MB.' };
    }
    return { valid: true };
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }
}
