import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApiPrefixMiddleware } from './api-prefix.middleware';

@Module({})
export class ApiPrefixModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiPrefixMiddleware)
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}