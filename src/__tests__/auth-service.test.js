import { jest } from '@jest/globals';

jest.unstable_mockModule('../db/db.js', () => ({
  pool: { query: jest.fn() },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule('../helpers/jwt.js', () => ({
  signToken: jest.fn(),
}));

const authService = await import('../services/auth-service.js');
const { pool } = await import('../db/db.js');
const bcrypt = (await import('bcryptjs')).default;
const { signToken } = await import('../helpers/jwt.js');

describe('Auth Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('registerUser', () => {
    test('should throw error if email already exists', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(authService.registerUser('test@test.com', 'pass', 'name'))
        .rejects.toThrow('Email already exists');
    });

    test('should create user and return token', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockResolvedValue('hashed_pass');
      
      const newUser = { id: 1, email: 'test@test.com', name: 'name' };
      pool.query.mockResolvedValueOnce({ rows: [newUser] });
      
      signToken.mockReturnValue('jwt_token');

      const result = await authService.registerUser('test@test.com', 'pass', 'name');

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(result).toEqual({ user: newUser, token: 'jwt_token' });
    });
  });

  describe('loginUser', () => {
    test('should throw error if user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await expect(authService.loginUser('test@test.com', 'pass'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should throw error if password mismatch', async () => {
      const user = { id: 1, password: 'hashed_pass' };
      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.loginUser('test@test.com', 'pass'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should return user and token on success', async () => {
      const user = { id: 1, email: 'test@test.com', name: 'name', password: 'hashed_pass' };
      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(true);
      signToken.mockReturnValue('jwt_token');

      const result = await authService.loginUser('test@test.com', 'pass');

      expect(result.token).toBe('jwt_token');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});