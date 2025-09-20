import { Request, Response } from "express";
import { CourseController } from "../src/controller/CourseController";
import { AppDataSource } from "../src/data-source";

// silence console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// mock AppDataSource and repository
jest.mock('../src/data-source', () => {
    const mockFind = jest.fn();
    return {
        AppDataSource: {
            getRepository: jest.fn().mockReturnValue({
                find: mockFind,
                count: jest.fn(),
                save: jest.fn(),
            }),
        },
        mockFind,
    };
});
  // mock courseController and use it to run api calls
describe('CourseController', () => {
  let courseController: CourseController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFind: jest.Mock;

  beforeEach(() => {
    courseController = new CourseController();
    mockFind = (AppDataSource.getRepository as jest.Mock)().find;
    
    // set up mock request and response
    mockRequest = {};
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

    // TEST: Testing getCourses method
  describe('getCourses', () => {
    it('should return all courses ordered by course code', async () => {
      //This test verifies that all courses are fetched if there any saved courses in the database

      const mockCourses = [
        {
          code: 'COSC0000',
          name: 'Introduction to Computer Science',
          description: 'Learn the fundamentals of computer science and programming',
          startDate: '2025-03-01',
          endDate: '2025-06-01',
        },
        {
          code: 'COSC0001',
          name: 'Full Stack Development',
          description: 'Learn to build complete web applications with frontend and backend',
          startDate: '2025-03-01',
          endDate: '2025-06-01',
        },
      ];

      mockFind.mockResolvedValue(mockCourses);

      // call the method
      await courseController.getCourses(
        mockRequest as Request,
        mockResponse as Response
      );

      // verify expected behavior
      expect(mockFind).toHaveBeenCalledWith({
        order: { code: 'ASC' },
      });
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockCourses);
    });

    it('should handle errors and return 500 status code', async () => {
      // mock the database error
      mockFind.mockRejectedValue(new Error('Database error'));

      // call the method
      await courseController.getCourses(
        mockRequest as Request,
        mockResponse as Response
      );

      // verify expected behavior
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});
