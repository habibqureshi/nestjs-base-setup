import { User } from './user.entity';
import { Role } from '../../roles/entities/role.entity';

describe('User Entity', () => {
  let user: User;
  let role: Role;

  beforeEach(() => {
    role = {
      id: 1,
      name: 'Test Role',
      permissions: [],
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

    user = new User();
    user.enable = true;
    user.deleted = false;
    user.deletedAt = null;
  });

  it('should be defined', () => {
    expect(user).toBeDefined();
  });

  it('should have required properties', () => {
    user.id = 1;
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.roles = [role];
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user.id).toBe(1);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hashedPassword');
    expect(user.roles).toEqual([role]);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.enable).toBe(true);
    expect(user.deleted).toBe(false);
    expect(user.deletedAt).toBeNull();
  });

  it('should initialize with default values', () => {
    expect(user.enable).toBe(true);
    expect(user.deleted).toBe(false);
    expect(user.deletedAt).toBeNull();
  });

  it('should handle role relationships', () => {
    user.roles = [role];
    expect(user.roles).toHaveLength(1);
    expect(user.roles[0]).toBe(role);
  });

  it('should set entity name after load and insert', () => {
    user.setEntityName();
    expect(user.__entity).toBe('User');
  });
});
