import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ChatGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('canActivate: ');
    // const request = context.switchToHttp().getRequest();
    // console.log('req: ', request);
    return true;
  }
}
