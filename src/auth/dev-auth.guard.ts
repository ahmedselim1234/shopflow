import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const id = req.headers['x-user-id'];
    if (!id) throw new UnauthorizedException('send x-user-id header (dev only)');
    req.user = { id, role: 'customer', permissions: [] };
    return true;
  }
}