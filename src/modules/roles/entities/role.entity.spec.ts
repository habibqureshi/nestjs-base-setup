import { Role } from './role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('Role Entity', () => {
  let role: Role;
  let permission: Permission;

  beforeEach(() => {
    permission = {
      id: 1,
      name: 'test:permission',
      url: '/test',
      regex: '^/test$',
      createdAt: new Date(),
      updatedAt: new Date(),
      enable: true,
      deleted: false,
      deletedAt: null,
      setEntityName: jest.fn(),
      hasId: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      softRemove: jest.fn(),
      recover: jest.fn(),
      reload: jest.fn(),
    };

    role = new Role();
    role.enable = true;
    role.deleted = false;
    role.deletedAt = null;
  });

  it('should be defined', () => {
    expect(role).toBeDefined();
  });

  it('should have required properties', () => {
    role.id = 1;
    role.name = 'Test Role';
    role.permissions = [permission];
    role.createdAt = new Date();
    role.updatedAt = new Date();

    expect(role.id).toBe(1);
    expect(role.name).toBe('Test Role');
    expect(role.permissions).toEqual([permission]);
    expect(role.createdAt).toBeInstanceOf(Date);
    expect(role.updatedAt).toBeInstanceOf(Date);
    expect(role.enable).toBe(true);
    expect(role.deleted).toBe(false);
    expect(role.deletedAt).toBeNull();
  });

  it('should initialize with default values', () => {
    expect(role.enable).toBe(true);
    expect(role.deleted).toBe(false);
    expect(role.deletedAt).toBeNull();
  });

  it('should handle permission relationships', () => {
    role.permissions = [permission];
    expect(role.permissions).toHaveLength(1);
    expect(role.permissions[0]).toBe(permission);
  });

  it('should have correct column configuration for name', () => {
    const metadata = getMetadataArgsStorage();
    const columns = metadata.columns.filter((col) => col.target === Role);
    const nameColumn = columns.find((col) => col.propertyName === 'name');

    expect(nameColumn).toBeDefined();
    expect(nameColumn.options).toEqual({
      type: 'varchar',
      length: 255,
      nullable: false,
    });
  });
});
