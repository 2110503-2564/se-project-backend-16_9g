const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); // adjust if needed

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// ✅ Helper to create a valid user easily
const createTestUser = (overrides = {}) => {
  return new User({
    name: 'Test User',
    email: 'test@example.com',
    tel: '1234567890',
    password: 'plainpassword',
    ...overrides,
  });
};

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  
  describe('UserSchema method: getSignedJwtToken', () => {
    it('should return a signed JWT token', () => {
      const mockToken = 'signed.jwt.token';
      const mockUser = createTestUser({
        _id: new mongoose.Types.ObjectId(),
      });

      jwt.sign.mockReturnValue(mockToken);

      const token = mockUser.getSignedJwtToken();

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('UserSchema method: matchPassword', () => {
    it('should return true if passwords match', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const user = createTestUser({ password: 'hashedPassword123' });

      const result = await user.matchPassword('enteredPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('enteredPassword', 'hashedPassword123');
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const user = createTestUser({ password: 'hashedPassword123' });

      const result = await user.matchPassword('wrongPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword123');
      expect(result).toBe(false);
    });
  });
});
