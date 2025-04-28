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

  describe('User Model - Pre Save Middleware', () => {
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should hash password if password is modified', async () => {
      const mockSalt = 'mockSalt123';
      const mockHash = 'mockHashedPassword123';
  
      bcrypt.genSalt.mockResolvedValue(mockSalt);
      bcrypt.hash.mockResolvedValue(mockHash);
  
      const user = createTestUser();
      user.isModified = jest.fn().mockReturnValue(true);
  
      // 💡 simulate pre-save manually
      await User.schema._middlewareFuncs.save[0].fn.call(user, jest.fn());
  
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', mockSalt);
      expect(user.password).toBe(mockHash);
    });
  
    it('should NOT hash password if password is NOT modified', async () => {
      const user = createTestUser({ password: 'alreadyHashedPassword' });
      user.isModified = jest.fn().mockReturnValue(false);
  
      const nextMock = jest.fn();
      await User.schema._middlewareFuncs.save[0].fn.call(user, nextMock);
  
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(user.password).toBe('alreadyHashedPassword');
      expect(nextMock).toHaveBeenCalled(); // make sure next() was called
    });
  
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
