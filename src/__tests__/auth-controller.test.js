import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const { register, login } = await import('../controllers/auth-controller.js');
const authService = await import('../services/auth-service.js');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should return 201 on success', async () => {
      req.body = { email: 'test', password: 'pass', name: 'name' };
      authService.registerUser.mockResolvedValue({ user: {}, token: 't' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 if email exists', async () => {
      authService.registerUser.mockRejectedValue(new Error('Email already exists'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
    });
  });

  describe('login', () => {
    test('should return 200 on success', async () => {
      authService.loginUser.mockResolvedValue({ user: {}, token: 't' });
      await login(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 400 on invalid credentials', async () => {
      authService.loginUser.mockRejectedValue(new Error('Invalid credentials'));
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});