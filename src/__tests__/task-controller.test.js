import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/task-service.js', () => ({
  createTask: jest.fn(),
  getTasksByUser: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  completeTask: jest.fn(),
}));

const taskService = await import('../services/task-service.js');
const taskController = await import('../controllers/task-controller.js');

const mockRequest = (body = {}, params = {}, user = { id: 1 }) => ({
  body,
  params,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Task Controller Unit Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should return 201 and the created task', async () => {
      const req = mockRequest({ title: 'New Task' });
      const res = mockResponse();
      const mockTask = { id: 1, title: 'New Task' };

      taskService.createTask.mockResolvedValue(mockTask);

      await taskController.createTask(req, res);

      expect(taskService.createTask).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 500 on service error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      taskService.createTask.mockRejectedValue(new Error('Service Error'));

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service Error' });
    });
  });

  describe('getTasks', () => {
    it('should return list of tasks', async () => {
      const req = mockRequest();
      const res = mockResponse();
      taskService.getTasksByUser.mockResolvedValue([]);

      await taskController.getTasks(req, res);

      expect(taskService.getTasksByUser).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('updateTask', () => {
    it('should return 404 if task not found', async () => {
      const req = mockRequest({ title: 'Update' }, { id: '999' });
      const res = mockResponse();
      
      taskService.updateTask.mockResolvedValue(null);

      await taskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });

    it('should return updated task if found', async () => {
      const req = mockRequest({ title: 'Update' }, { id: '1' });
      const res = mockResponse();
      const updatedTask = { id: 1, title: 'Update' };

      taskService.updateTask.mockResolvedValue(updatedTask);

      await taskController.updateTask(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should return success message', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      taskService.deleteTask.mockResolvedValue(true);

      await taskController.deleteTask(req, res);

      expect(taskService.deleteTask).toHaveBeenCalledWith(1, '1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted' });
    });
  });
});