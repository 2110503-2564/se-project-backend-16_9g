// tests/reservationController.test.js

const { getReservations } = require('../controllers/reservations');
const Reservation = require('../models/Reservation');

// Mock Mongoose Reservation model
jest.mock('../models/Reservation');

// Helper to mock Reservation.find() with chained populate()
function createMockReservationFind(mockData) {
  return {
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockData)
    })
  };
}

describe('getReservations', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'user1', role: 'user' },
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  it('should fetch reservations for a normal user', async () => {
    const mockReservations = [{ id: 'res1' }, { id: 'res2' }];

    Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

    await getReservations(req, res, next);

    expect(Reservation.find).toHaveBeenCalledWith({ user: 'user1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockReservations.length,
      data: mockReservations
    });
  });

  it('should fetch reservations for an admin without restaurantId', async () => {
    req.user.role = 'admin';

    const mockReservations = [{ id: 'res1' }];

    Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

    await getReservations(req, res, next);

    expect(Reservation.find).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockReservations.length,
      data: mockReservations
    });
  });

  it('should fetch reservations for an admin with restaurantId', async () => {
    req.user.role = 'admin';
    req.params.restaurantId = 'rest123';

    const mockReservations = [{ id: 'res2' }];

    Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

    await getReservations(req, res, next);

    expect(Reservation.find).toHaveBeenCalledWith({ restaurant: 'rest123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockReservations.length,
      data: mockReservations
    });
  });

  it('should handle errors', async () => {
    // Mock .find() throwing an error inside populate
    Reservation.find.mockReturnValue({
      populate: jest.fn().mockImplementation(() => {
        throw new Error('Database Error');
      })
    });

    await getReservations(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot find Reservation"
    });
  });
});


// describe('getReservation', () => {
//   let req, res, next;

//   beforeEach(() => {
//     req = {
//       user: { id: 'user1', role: 'user' },
//       params: {}
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//     next = jest.fn();

//     jest.clearAllMocks();
//   });

//   it('should fetch reservations for a normal user', async () => {
//     const mockReservations = [{ id: 'res1' }, { id: 'res2' }];

//     Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

//     await getReservations(req, res, next);

//     expect(Reservation.find).toHaveBeenCalledWith({ user: 'user1' });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       count: mockReservations.length,
//       data: mockReservations
//     });
//   });

//   it('should fetch reservations for an admin without restaurantId', async () => {
//     req.user.role = 'admin';

//     const mockReservations = [{ id: 'res1' }];

//     Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

//     await getReservations(req, res, next);

//     expect(Reservation.find).toHaveBeenCalledWith();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       count: mockReservations.length,
//       data: mockReservations
//     });
//   });

//   it('should fetch reservations for an admin with restaurantId', async () => {
//     req.user.role = 'admin';
//     req.params.restaurantId = 'rest123';

//     const mockReservations = [{ id: 'res2' }];

//     Reservation.find.mockReturnValue(createMockReservationFind(mockReservations));

//     await getReservations(req, res, next);

//     expect(Reservation.find).toHaveBeenCalledWith({ restaurant: 'rest123' });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       count: mockReservations.length,
//       data: mockReservations
//     });
//   });

//   it('should handle errors', async () => {
//     // Mock .find() throwing an error inside populate
//     Reservation.find.mockReturnValue({
//       populate: jest.fn().mockImplementation(() => {
//         throw new Error('Database Error');
//       })
//     });

//     await getReservations(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Cannot find Reservation"
//     });
//   });
// });
