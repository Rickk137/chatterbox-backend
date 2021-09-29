import { I18nService } from 'nestjs-i18n';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    const res = exception.getResponse() as {
      key: string;
      message: string;
      args: Record<string, any>;
    };

    let message;
    try {
      message = await this.i18n.translate(res.key, {
        lang: ctx.getRequest()?.headers['x-custom-lang'],
        args: res.args,
      });
    } catch (error) {
      message = res.message;
    }

    response.status(statusCode).json({ statusCode, message });
  }
}
