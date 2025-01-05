import { Injectable, Logger, Scope } from '@nestjs/common';
import { RequestContext } from 'nestjs-request-context';

@Injectable({ scope: Scope.REQUEST })
export class CustomLoggerService extends Logger {
  log(message: string | object) {
    const timestamp = new Date().toISOString();
    const filename = this.getFilename();
    const lineNumber = this.getLineNumber();
    const request = this.getRequest();
    const requestId = request['requestId'] || '0';
    const ipAddress = request['ip'] || 'No IP';
    const user = request['user'] || 'System';
    const messageToLogged =
      typeof message == 'string' ? message : JSON.stringify(message);
    // super.log(`[${timestamp}] [${filename}:${lineNumber}] [${username}] ${message}`, context);
    super.log(
      `${requestId} ${ipAddress} ${user.email} ${timestamp} ${filename} : ${lineNumber}   ${messageToLogged}`,
    );
  }
  error(message: string, trace: string, context?: string) {
    const timestamp = new Date().toISOString();
    const filename = this.getFilename();
    const lineNumber = this.getLineNumber();

    // const username = request?.user?.username || 'Unknown User';
    // super.error(`[${timestamp}] [${filename}:${lineNumber}] [${username}] ${message}`, trace, context);
    super.error(
      `[${timestamp}] [${filename}:${lineNumber}]  ${message}`,
      trace,
      context,
    );
  }

  private getRequest(): Request {
    return RequestContext.currentContext.req as Request;
  }

  private getFilename(): string {
    const error = new Error();
    const stack = error.stack?.split('\n')[3].trim() || '';
    const filename = stack.substring(
      stack.lastIndexOf('/') + 1,
      stack.indexOf(':'),
    );
    return filename;
  }

  private getLineNumber(): string {
    const error = new Error();
    const stack = error.stack?.split('\n')[3].trim() || '';
    const lineNumber = stack.substring(
      stack.lastIndexOf(':') + 1,
      stack.lastIndexOf(')'),
    );
    return lineNumber;
  }
}
