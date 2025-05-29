import { Permission } from './permission.entity';

describe('Permission Entity', () => {
  let permission: Permission;

  beforeEach(() => {
    permission = new Permission();
  });

  it('should be defined', () => {
    expect(permission).toBeDefined();
  });

  it('should have required properties', () => {
    permission.name = 'Test Permission';
    permission.url = '/test';
    permission.regex = '^/test$';

    expect(permission.name).toBeDefined();
    expect(permission.url).toBeDefined();
    expect(permission.regex).toBeDefined();
  });

  it('should have default values from BaseEntity', () => {
    expect(permission.id).toBeUndefined();
    expect(permission.createdAt).toBeUndefined();
    expect(permission.updatedAt).toBeUndefined();
    expect(permission.enable).toBeUndefined();
    expect(permission.deleted).toBeUndefined();
    expect(permission.deletedAt).toBeUndefined();
  });

  it('should have BaseEntity methods', () => {
    expect(typeof permission.setEntityName).toBe('function');
    expect(typeof permission.hasId).toBe('function');
    expect(typeof permission.save).toBe('function');
    expect(typeof permission.remove).toBe('function');
    expect(typeof permission.softRemove).toBe('function');
    expect(typeof permission.recover).toBe('function');
    expect(typeof permission.reload).toBe('function');
  });
});
