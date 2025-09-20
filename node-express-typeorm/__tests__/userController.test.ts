import { Request, Response } from "express";
import { UserController } from "../src/controller/UserController";
import { AppDataSource } from "../src/data-source";
import { UserRole } from "../src/entity/User";
import bcrypt from "bcryptjs";

// mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

// silence console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// mock AppDataSource for user repository
jest.mock('../src/data-source', () => {
  const mockFindOne = jest.fn();
  return {
    AppDataSource: {
      getRepository: jest.fn().mockReturnValue({
        findOne: mockFindOne,
        find: jest.fn(),
        save: jest.fn(),
      }),
    },
    mockFindOne,
  };
});

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFindOne: jest.Mock;
  let mockCompare: jest.Mock;

  beforeEach(() => {
    userController = new UserController();
    mockFindOne = (AppDataSource.getRepository as jest.Mock)().findOne;
    mockCompare = bcrypt.compare as jest.Mock;

    // set up mock request and response
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST: Testing the authenticate (login) method
  describe('authenticate', () => {
    // Test 1: Successful login with encrypted password
    it('should authenticate a user with valid credentials and return user data', async () => {
      // This test verifies proper login behavior with valid credentials
      // including password hashing and user data in response
      
      // set up request with login credentials
      mockRequest.body = {
        email: 'user@example.com',
        password: 'Password123!',
      };
      
      // mock user found in database
      const mockUser = {
        id: 123,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        role: UserRole.CANDIDATE,
        isBlocked: false,
      };
      
      mockFindOne.mockResolvedValue(mockUser);
      
      // mock successful password comparison
      mockCompare.mockResolvedValue(true);
      
      // call the controller method
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify user lookup with correct email
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      
      // verify password was compared
      expect(mockCompare).toHaveBeenCalledWith('Password123!', 'hashedPassword');
      
      // verify successful response without the password field
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        user: expect.objectContaining({
          id: 123,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      });
      
      // verify password is not included in response
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        user: expect.not.objectContaining({
          password: expect.anything(),
        }),
      });
    });

    // Test 2: Invalid email or user not found
    it('should return 401 when user with provided email does not exist', async () => {
      // This test verifies error handling when a non-existent email is provided
      
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };
      
      // no user found in database
      mockFindOne.mockResolvedValue(null);
      
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify appropriate error response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
      
      // password should not have been compared
      expect(mockCompare).not.toHaveBeenCalled();
    });

    // Test 3: Incorrect password
    it('should return 401 when password is incorrect', async () => {
      // This test verifies error handling when the password is wrong
      
      mockRequest.body = {
        email: 'user@example.com',
        password: 'WrongPassword123!',
      };
      
      // user found but password won't match
      mockFindOne.mockResolvedValue({
        id: 123,
        email: 'user@example.com',
        password: 'hashedPassword',
        isBlocked: false,
      });
      
      // password comparison fails
      mockCompare.mockResolvedValue(false);
      
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify appropriate error response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
    });

    // Test 4: Blocked user
    it('should return 403 when user account is blocked', async () => {
      // This test verifies proper handling of blocked user accounts
      
      mockRequest.body = {
        email: 'blocked@example.com',
        password: 'Password123!',
      };
      
      // user found but is blocked
      mockFindOne.mockResolvedValue({
        id: 456,
        email: 'blocked@example.com',
        password: 'hashedPassword',
        isBlocked: true,
      });
      
      // password matches but user is blocked
      mockCompare.mockResolvedValue(true);
      
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify blocked account error
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Your account has been blocked. Please contact support."
      });
    });

    // Test 5: Missing credentials
    it('should return 400 when email or password is missing', async () => {
      // This test verifies input validation
      
      // missing password
      mockRequest.body = {
        email: 'user@example.com',
      };
      
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify bad request response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email and password are required"
      });
      
      // missing email
      mockRequest.body = {
        password: 'Password123!',
      };
      
      await userController.authenticate(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // verify bad request response again
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});