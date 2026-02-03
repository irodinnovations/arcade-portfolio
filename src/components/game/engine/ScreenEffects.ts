import type { ScreenEffect } from './types';

export class ScreenEffects {
  private effect: ScreenEffect = {
    shake: 0,
    shakeDecay: 0.9,
    flash: 0,
    flashColor: '#ffffff',
    chromatic: 0,
    slowmo: 1,
  };

  private shakeOffset = { x: 0, y: 0 };

  update(deltaTime: number): void {
    const dt = deltaTime / 16.67;

    // Decay shake
    if (this.effect.shake > 0.1) {
      this.effect.shake *= Math.pow(this.effect.shakeDecay, dt);
      this.shakeOffset.x = (Math.random() - 0.5) * this.effect.shake;
      this.shakeOffset.y = (Math.random() - 0.5) * this.effect.shake;
    } else {
      this.effect.shake = 0;
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    // Decay flash
    if (this.effect.flash > 0) {
      this.effect.flash -= deltaTime * 0.005;
      if (this.effect.flash < 0) this.effect.flash = 0;
    }

    // Decay chromatic
    if (this.effect.chromatic > 0) {
      this.effect.chromatic *= 0.95;
      if (this.effect.chromatic < 0.1) this.effect.chromatic = 0;
    }

    // Return slowmo to normal
    if (this.effect.slowmo < 1) {
      this.effect.slowmo += deltaTime * 0.002;
      if (this.effect.slowmo > 1) this.effect.slowmo = 1;
    }
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    if (this.effect.shake > 0.1) {
      ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
    }
  }

  renderOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Flash overlay
    if (this.effect.flash > 0) {
      ctx.save();
      ctx.globalAlpha = this.effect.flash;
      ctx.fillStyle = this.effect.flashColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Vignette (always on, subtle)
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.3,
      width / 2,
      height / 2,
      height * 0.8
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Trigger methods
  shake(intensity: number = 10, decay: number = 0.9): void {
    this.effect.shake = Math.max(this.effect.shake, intensity);
    this.effect.shakeDecay = decay;
  }

  flash(color: string = '#ffffff', intensity: number = 0.5): void {
    this.effect.flash = intensity;
    this.effect.flashColor = color;
  }

  chromatic(intensity: number = 5): void {
    this.effect.chromatic = intensity;
  }

  slowmo(factor: number = 0.3): void {
    this.effect.slowmo = factor;
  }

  // Impact effect - combines shake, flash, and chromatic
  impact(intensity: number = 1): void {
    this.shake(8 * intensity, 0.85);
    this.flash('#ffffff', 0.3 * intensity);
    this.chromatic(3 * intensity);
  }

  // Big impact for boss hits, deaths, etc.
  bigImpact(): void {
    this.shake(20, 0.88);
    this.flash('#ff4444', 0.5);
    this.chromatic(8);
    this.slowmo(0.2);
  }

  // Victory effect
  victory(): void {
    this.flash('#00ff88', 0.6);
    this.shake(15, 0.92);
  }

  get timeScale(): number {
    return this.effect.slowmo;
  }

  get chromaticOffset(): number {
    return this.effect.chromatic;
  }

  reset(): void {
    this.effect = {
      shake: 0,
      shakeDecay: 0.9,
      flash: 0,
      flashColor: '#ffffff',
      chromatic: 0,
      slowmo: 1,
    };
    this.shakeOffset = { x: 0, y: 0 };
  }
}
