// tests/pointTransactionController.test.js

const { getPointTransactions } = require('../controllers/pointTransaction');
const PointTransaction = require('../models/PointTransaction');

jest.mock('../models/PointTransaction');

describe('getPointTransactions', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'user1', role: 'user' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  const createMockPointTransactionFind = (mockTransactions) => ({
    populate: jest.fn().mockReturnThis(),
    then: jest.fn((callback) => callback(mockTransactions)),
  });

  it('should fetch point transactions for a normal user', async () => {
    const mockTransactions = [{ id: 'txn1' }, { id: 'txn2' }];

    PointTransaction.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb(mockTransactions)), // Simulate await
    });

    await getPointTransactions(req, res, next);

    expect(PointTransaction.find).toHaveBeenCalledWith({ user: 'user1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockTransactions.length,
      data: mockTransactions,
    });
  });

  it('should fetch all point transactions for an admin', async () => {
    req.user.role = 'admin';

    const mockTransactions = [{ id: 'txn3' }];

    PointTransaction.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb(mockTransactions)),
    });

    await getPointTransactions(req, res, next);

    expect(PointTransaction.find).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockTransactions.length,
      data: mockTransactions,
    });
  });

  it('should handle errors', async () => {
    PointTransaction.find.mockImplementation(() => {
      throw new Error('Database Error');
    });

    await getPointTransactions(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cannot fetch point transactions',
    });
  });
});
