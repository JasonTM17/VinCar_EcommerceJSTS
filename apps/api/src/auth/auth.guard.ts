import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const h: string | undefined = req.headers['authorization'];
    if (!h?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    try { req.user = this.jwt.verify(h.slice(7)); return true; } catch { throw new UnauthorizedException('Invalid token'); }
  }
}
