import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const request = context.switchToHttp().getRequest();
    // const currentUser = request.user;

    // if (currentUser) {
    //   console.log('Current User in Interceptor:', currentUser);
    //   // You can perform actions with currentUser here
    // }

    return next.handle();
  }
}
