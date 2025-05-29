import { Public, IS_PUBLIC_KEY } from './public.route.decorator';
import { SetMetadata, CustomDecorator } from '@nestjs/common';

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual(
    '@nestjs/common',
  ) as typeof import('@nestjs/common');
  return {
    ...actual,
    SetMetadata: jest
      .fn()
      .mockImplementation(
        (key: string, _: boolean): CustomDecorator<string> => {
          const decorator = function (
            target: unknown,
            key?: string | symbol,
            descriptor?: PropertyDescriptor,
          ) {
            return descriptor;
          } as CustomDecorator<string>;
          decorator.KEY = key;
          return decorator;
        },
      ),
  };
});

describe('Public Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call SetMetadata with correct key and value', () => {
    // Act
    Public();

    // Assert
    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
    expect(SetMetadata).toHaveBeenCalledTimes(1);
  });

  it('should return a CustomDecorator', () => {
    // Arrange
    const mockDecorator = {
      KEY: IS_PUBLIC_KEY,
    } as CustomDecorator;
    (SetMetadata as jest.Mock).mockReturnValue(mockDecorator);

    // Act
    const decorator = Public();

    // Assert
    expect(decorator).toBe(mockDecorator);
  });

  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should set metadata with IS_PUBLIC_KEY and true value', () => {
    const result: ReturnType<typeof SetMetadata> = Public();
    expect(result).toBe(SetMetadata('isPublic', true));
  });
});
