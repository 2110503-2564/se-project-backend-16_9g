// tests/notificationController.test.js

const { addNotification, getNotifications, markAllAsRead } = require('../controllers/notifications');
const Notification = require('../models/Notification');

jest.mock('../models/Notification');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user1' },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ----------- Test addNotification ----------------
  describe('addNotification', () => {
    it('should create a notification', async () => {
      const mockNotification = { id: 'notif1', title: 'Test', message: 'Hello' };
      req.body = { title: 'Test', message: 'Hello' };
      Notification.create.mockResolvedValue(mockNotification);

      await addNotification(req, res);

      expect(Notification.create).toHaveBeenCalledWith({
        user: 'user1',
        title: 'Test',
        message: 'Hello',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
      });
    });

    it('should handle errors', async () => {
      Notification.create.mockRejectedValue(new Error('Database Error'));

      await addNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create notification',
      });
    });
  });

  // ----------- Test getNotifications ----------------
  describe('getNotifications', () => {
    it('should fetch user notifications', async () => {
      const mockNotifications = [{ id: 'notif1' }, { id: 'notif2' }];
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications),
      });

      await getNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockNotifications.length,
        data: mockNotifications,
      });
    });

    it('should handle errors', async () => {
      Notification.find.mockImplementation(() => {
        throw new Error('Database Error');
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch notifications',
      });
    });
  });

  // ----------- Test markAllAsRead ----------------
  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResult = { modifiedCount: 2 };
      Notification.updateMany.mockResolvedValue(mockResult);

      await markAllAsRead(req, res);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: 'user1', isRead: false },
        { $set: { isRead: true } }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read successfully',
        data: mockResult,
      });
    });

    it('should handle errors', async () => {
      Notification.updateMany.mockRejectedValue(new Error('Database Error'));

      await markAllAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update notifications',
      });
    });
  });
});
