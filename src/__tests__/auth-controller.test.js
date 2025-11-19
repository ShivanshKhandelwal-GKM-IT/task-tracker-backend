import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const mockCookie = jest.fn().mockReturnThis();

const { register, login, me, logout } = await import('../controllers/auth-controller.js');
const authService = await import('../services/auth-service.js');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: mockCookie,
    };
    
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validBody = { email: 'test@example.com', password: 'password', name: 'Name' };
    const successResult = { user: { id: 1, email: validBody.email }, token: 'test-token' };

    test('should return 201 on success and set cookie', async () => {
      req.body = validBody;
      authService.registerUser.mockResolvedValue(successResult);

      await register(req, res);

      expect(authService.registerUser).toHaveBeenCalledWith(validBody.email, validBody.password, validBody.name);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockCookie).toHaveBeenCalledWith('token', successResult.token, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ user: successResult.user });
    });

    test('should return 400 if email format is invalid', async () => {
      req.body = { ...validBody, email: 'invalid-email' };

      await register(req, res);

      expect(authService.registerUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
    });

    test('should return 400 if email already exists', async () => {
      req.body = validBody;
      authService.registerUser.mockRejectedValue(new Error('Email already exists'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
    });

    test('should return 500 on other server errors', async () => {
      req.body = validBody;
      authService.registerUser.mockRejectedValue(new Error('Database connection failed'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error during registration' });
    });
  });

  describe('login', () => {
    const validBody = { email: 'test@example.com', password: 'password' };
    const successResult = { user: { id: 1, email: validBody.email }, token: 'test-token' };

    test('should return 200 on success and set cookie', async () => {
      req.body = validBody;
      authService.loginUser.mockResolvedValue(successResult);

      await login(req, res);

      expect(authService.loginUser).toHaveBeenCalledWith(validBody.email, validBody.password);
      expect(res.status).not.toHaveBeenCalled(); // Default is 200
      expect(mockCookie).toHaveBeenCalledWith('token', successResult.token, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ user: successResult.user });
    });

    test('should return 400 if email format is invalid', async () => {
      req.body = { ...validBody, email: 'invalid-email' };

      await login(req, res);

      expect(authService.loginUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
    });

    test('should return 400 on invalid credentials', async () => {
      req.body = validBody;
      authService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    test('should return 500 on other server errors', async () => {
      req.body = validBody;
      authService.loginUser.mockRejectedValue(new Error('Database connection failed'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error during login' });
    });
  });

  describe('me', () => {
    test('should return the user from the request object', () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      req.user = mockUser; // Assumes middleware populated req.user

      me(req, res);

      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
  });

  describe('logout', () => {
    test('should clear the token cookie and return success message', () => {
      logout(req, res);

      expect(mockCookie).toHaveBeenCalledWith('token', '', expect.objectContaining({
        expires: expect.any(Date) // Expects expires to be set, indicating cookie clear
      }));
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});