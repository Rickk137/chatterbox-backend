import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class PagerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.query.limit = +req.query.perPage || 50;
    req.query.skip = (+req.query.page - 1 || 0) * req.query.limit;
    next();
  }
}
