/**
 * Clean Architecture - Domain Entity: Banner
 * Represents hero banners and promotional carousels.
 */

export interface BannerProps {
  id: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  badge?: string;
  bgGradient?: string;
  imageUrl?: string;
  isActive: boolean;
  order?: number;
}

export class Banner {
  constructor(public readonly props: BannerProps) {
    this.validate();
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('El título del banner no puede estar vacío.');
    }
  }

  public toJSON(): BannerProps {
    return { ...this.props };
  }
}
