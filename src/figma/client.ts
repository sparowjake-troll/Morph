import { FigmaError } from '../core/errors.js';
import type { FigmaFile } from '../core/types.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export class FigmaClient {
  private token: string;

  constructor(accessToken?: string) {
    this.token = accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
    if (!this.token) {
      throw new FigmaError('Figma access token required. Set FIGMA_ACCESS_TOKEN env var or pass in config.');
    }
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: { 'X-Figma-Token': this.token },
    });

    if (!response.ok) {
      throw new FigmaError(`Figma API error: ${response.status} ${response.statusText}`, {
        endpoint,
        status: response.status,
      });
    }

    return response.json() as Promise<T>;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    const data = await this.request<{ name: string; lastModified: string; document: Record<string, unknown>; styles: Record<string, unknown>; components: Record<string, unknown> }>(`/files/${fileKey}`);

    return {
      name: data.name,
      lastModified: data.lastModified,
      document: data.document,
      styles: data.styles as FigmaFile['styles'],
      components: data.components as FigmaFile['components'],
    };
  }

  async getFileStyles(fileKey: string): Promise<Array<{ key: string; name: string; styleType: string; description?: string }>> {
    const data = await this.request<{ meta: { styles: Array<{ key: string; name: string; style_type: string; description?: string }> } }>(`/files/${fileKey}/styles`);

    return data.meta.styles.map((s) => ({
      key: s.key,
      name: s.name,
      styleType: s.style_type,
      description: s.description,
    }));
  }

  async getFileComponents(fileKey: string): Promise<Array<{ key: string; name: string; description?: string; containingFrame?: { name: string } }>> {
    const data = await this.request<{ meta: { components: Array<{ key: string; name: string; description?: string; containing_frame?: { name: string } }> } }>(`/files/${fileKey}/components`);

    return data.meta.components.map((c) => ({
      key: c.key,
      name: c.name,
      description: c.description,
      containingFrame: c.containing_frame ? { name: c.containing_frame.name } : undefined,
    }));
  }

  static extractFileKey(url: string): string {
    // Figma URLs: https://www.figma.com/file/XXXXX/...  or  https://www.figma.com/design/XXXXX/...
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new FigmaError('Invalid Figma URL. Expected format: https://www.figma.com/file/<key>/...');
    }
    return match[1];
  }
}
