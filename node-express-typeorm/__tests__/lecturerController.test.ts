import { Request, Response } from "express";
import { LecturerController } from "../src/controller/LecturerController";
import { AppDataSource } from "../src/data-source";

// silence console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// mock AppDataSource with all required repositories
jest.mock('../src/data-source', () => {
  const mockFindOne = jest.fn();
  const mockFind = jest.fn();
  const mockSave = jest.fn();
  
  const mockGetCount = jest.fn().mockResolvedValue(2);
  const mockGetMany = jest.fn();
  
  const mockWhere = jest.fn().mockReturnValue({
    getCount: mockGetCount,
    getMany: mockGetMany,
    andWhere: jest.fn().mockReturnThis(),
  });
  
  const mockInnerJoin = jest.fn().mockReturnValue({
    where: mockWhere,
  });
  
  const mockCreateQueryBuilder = jest.fn().mockReturnValue({
    innerJoin: mockInnerJoin,
    where: mockWhere,
    getCount: mockGetCount,
    getMany: mockGetMany,
  });

  return {
    AppDataSource: {
      getRepository: jest.fn().mockImplementation(() => {
        return {
          findOne: mockFindOne,
          find: mockFind,
          save: mockSave,
          createQueryBuilder: mockCreateQueryBuilder,
          remove: jest.fn(),
          delete: jest.fn(),
          findOneBy: jest.fn(),
          create: jest.fn().mockImplementation((entity) => entity),
        };
      }),
    },
    mockFindOne,
    mockFind,
    mockSave,
    mockCreateQueryBuilder,
    mockGetCount,
  };
});

describe('LecturerController', () => {
  let lecturerController: LecturerController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFindOne: jest.Mock;
  let mockSave: jest.Mock;
  let mockCreateQueryBuilder: jest.Mock;

  beforeEach(() => {
    lecturerController = new LecturerController();
    
    // mocks from the mock factory
    mockFindOne = (AppDataSource.getRepository as jest.Mock)().findOne;
    mockSave = (AppDataSource.getRepository as jest.Mock)().save;
    mockCreateQueryBuilder = (AppDataSource.getRepository as jest.Mock)().createQueryBuilder;

    // mock request and response
    mockRequest = {
      params: { code: 'COSC0001' },
      body: { applicationId: 123 }
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST: Testing the selectApplication method
  describe('selectApplication', () => {
    // Test 1: successful selection of an application
    it('should successfully select an application for a course', async () => {
      // This test verifies the entire process of selecting an application:
      // 1. Finding the application
      // 2. Checking if it's already selected
      // 3. Determining the correct rank
      // 4. Updating the application
      // 5. Creating and saving the selection

      // mock application data
      const mockApplication = {
        applicationId: 123,
        userId: 456,
        courseCode: 'COSC0001',
        selected: false,
        user: { id: 456, firstName: 'John', lastName: 'Doe' }
      };

      // mocks for the various repository calls
      mockFindOne.mockImplementation((options) => {
        // for finding the application
        if (options?.where?.applicationId === 123 && options?.where?.courseCode === 'COSC0001') {
          return Promise.resolve(mockApplication);
        }
        // for checking if already selected (should return null)
        if (options?.where?.applicationId === 123) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      
      // save method mock version for both application update and selection creation
      mockSave.mockImplementation((entity) => {
        if (Array.isArray(entity)) return Promise.resolve(entity);
        
        // when saving the application with selected=true
        if (entity.applicationId === 123 && entity.selected === true) {
          return Promise.resolve(entity);
        }
        
        // when saving the new selected application
        if (entity.applicationId === 123 && entity.rank === 3) {
          return Promise.resolve({ ...entity, id: 789 });
        }
        
        return Promise.resolve(entity);
      });

      // controller method
      await lecturerController.selectApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      // verify the application was found
      expect(mockFindOne).toHaveBeenCalledWith({
        where: {
          applicationId: 123,
          courseCode: 'COSC0001',
        },
        relations: ["user"],
      });
      
      // verify checked if already selected
      expect(mockFindOne).toHaveBeenCalledWith({
        where: {
          applicationId: 123,
        },
      });
      
      // verify rank determination query was constructed
      expect(mockCreateQueryBuilder).toHaveBeenCalled();
      
      // verify application was updated (selected = true)
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        applicationId: 123,
        selected: true
      }));
      
      // verify a selected application was saved with rank=3 (2 existing + 1)
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        applicationId: 123,
        userId: 456,
        rank: 3
      }));
      
      // verify response
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Applicant selected successfully"
      }));
    });

    // Test 2: Application not found
    it('should return 404 when application does not exist', async () => {
      // This test verifies proper error handling when the requested application doesn't exist
      mockFindOne.mockResolvedValue(null); // no application found

      await lecturerController.selectApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Application not found for this course"
      });

      // verify no save operations were performed
      expect(mockSave).not.toHaveBeenCalled();
    });

    // Test 3: Already selected
    it('should return 400 when application is already selected', async () => {
      // This test verifies the validation check for already selected applications
      
      // mock finding the application successfully
      mockFindOne.mockImplementationOnce(() => Promise.resolve({
        applicationId: 123,
        courseCode: 'COSC0001',
        selected: false,
        userId: 456,
        user: { id: 456 }
      }));
      
      // mock that the application is already selected
      mockFindOne.mockImplementationOnce(() => Promise.resolve({
        id: 789,
        applicationId: 123,
        rank: 1
      }));

      await lecturerController.selectApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Application is already selected for this course"
      });
      
      // Verify no save operations were performed
      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});