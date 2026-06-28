import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.resolve(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolve(exception: unknown): { statusCode: number; message: string } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message?.toString() ??
            exception.message;
      return { statusCode: exception.getStatus(), message };
    }

    if (exception instanceof QueryFailedError) {
      const mysqlError = exception as QueryFailedError & { errno?: number };
      if (mysqlError.errno === 1062) {
        return { statusCode: HttpStatus.CONFLICT, message: 'A record with this value already exists.' };
      }
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'Database operation failed.' };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
    };
  }
}
