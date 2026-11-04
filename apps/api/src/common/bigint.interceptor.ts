import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Prisma returns BigInt for money columns. JSON.stringify cannot serialize
 * BigInt, so every response passes through this converter before encoding.
 * Money stays exact: BigInt -> decimal string, never floating point.
 */
export function convertBigInts(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(convertBigInts);
  if (value !== null && typeof value === 'object') {
    if (value instanceof Date) return value;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, convertBigInts(entry)]),
    );
  }
  return value;
}

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => convertBigInts(data)));
  }
}
