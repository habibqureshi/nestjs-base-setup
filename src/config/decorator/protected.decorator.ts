import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PORTECTED_KEY = 'isProtected';
export const Protected = (): CustomDecorator<string> =>
  SetMetadata(PORTECTED_KEY, true);
