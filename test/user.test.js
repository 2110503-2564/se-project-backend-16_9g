// __tests__/userController.test.js
const { getUserPointByUserId, getUserRewards } = require('../controllers/user');
const User = require('../models/User'); // Adjust path

jest.mock('../models/User'); // Mock User model

describe('getUserPointByUserId', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: 'user123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return user data when user is found', async () => {
    const mockUser = { name: 'John Doe', tel: '123456789', currentPoints: 50 };
    User.findById = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue(mockUser)
});

    await getUserPointByUserId(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUser
    });
  });

  it('should return 404 if user not found', async () => {
    User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
    });

    await getUserPointByUserId(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `No user id of user123`
    });
  });

  it('should handle errors and return 500', async () => {
    User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
    });
    await getUserPointByUserId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cannot find Reservation'
    });
  });
});

describe('getUserRewards', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = { params: { id: 'user123' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });
  
    it('should return user rewards when user is found', async () => {
      const mockUser = { name: 'John Doe', rewards: ['reward1', 'reward2'] };
  
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
  
      await getUserRewards(req, res, next);
  
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
  
    it('should return 404 if user not found', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
  
      await getUserRewards(req, res, next);
  
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `No user id of user123`
      });
    });
  
    it('should handle errors and return 500', async () => {
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });
  
      await getUserRewards(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot find Rewards'
      });
    });
  });
