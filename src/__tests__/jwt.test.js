import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

const { signToken, verifyToken } = await import('../helpers/jwt.js');
const jwt = (await import('jsonwebtoken')).default;

describe('JWT Helper', () => {
  const mockPayload = { id: 1 };
  const mockToken = 'mock.token.string';
  process.env.JWT_SECRET = 'test_secret';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('signToken should sign the payload', () => {
    jwt.sign.mockReturnValue(mockToken);

    const result = signToken(mockPayload);

    expect(jwt.sign).toHaveBeenCalledWith(mockPayload, 'test_secret', { expiresIn: '7d' });
    expect(result).toBe(mockToken);
  });

  test('verifyToken should verify the token', () => {
    jwt.verify.mockReturnValue(mockPayload);

    const result = verifyToken(mockToken);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test_secret');
    expect(result).toBe(mockPayload);
  });
});