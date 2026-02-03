import type { Entity, Vector2D } from './types';

/**
 * Calculate distance between two points
 */
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two circular entities are colliding
 */
export function circleCollision(
  a: Entity,
  b: Entity,
  padding: number = 0
): boolean {
  const dist = distance(a, b);
  const combinedRadius = a.width / 2 + b.width / 2 - padding;
  return dist < combinedRadius;
}

/**
 * Check if a point is within radius of an entity
 */
export function pointInRadius(
  point: Vector2D,
  entity: Entity,
  radius: number
): boolean {
  return distance(point, entity) < radius;
}

/**
 * Check bullet-entity collision
 */
export function bulletHitsEntity(
  bullet: Vector2D,
  entity: Entity,
  bulletRadius: number = 5
): boolean {
  const dist = distance(bullet, entity);
  return dist < entity.width / 2 + bulletRadius;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Keep entity within bounds
 */
export function constrainToBounds(
  entity: Entity,
  canvasWidth: number,
  canvasHeight: number,
  minY?: number
): void {
  const halfWidth = entity.width / 2;
  const halfHeight = entity.height / 2;
  
  entity.x = clamp(entity.x, halfWidth, canvasWidth - halfWidth);
  entity.y = clamp(
    entity.y,
    minY ?? halfHeight,
    canvasHeight - halfHeight
  );
}
