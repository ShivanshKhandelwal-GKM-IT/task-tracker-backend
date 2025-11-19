import { jest } from '@jest/globals';

jest.unstable_mockModule('../db/db.js', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = await import('../db/db.js');
const taskService = await import('../services/task-service.js');

describe('Task Service Unit Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should insert a new task and return it', async () => {
      const mockTask = { id: 1, title: 'New Task', user_id: 1 };
      pool.query.mockResolvedValue({ rows: [mockTask] });

      const result = await taskService.createTask(1, { 
        title: 'New Task', 
        description: 'Desc', 
        deadline: '2025-01-01' 
      });

      expect(result).toEqual(mockTask);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.arrayContaining(['New Task', 'Desc', 1, 1]) 
      );
    });
  });

  describe('getTasksByUser', () => {
    it('should return a list of tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1' }];
      pool.query.mockResolvedValue({ rows: mockTasks });

      const result = await taskService.getTasksByUser(1);

      expect(result).toEqual(mockTasks);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        [1]
      );
    });
  });

  describe('updateTask', () => {
    it('should return updated task if found', async () => {
      const updatedTask = { id: 1, title: 'Updated' };
      pool.query.mockResolvedValue({ rows: [updatedTask] });

      const result = await taskService.updateTask(1, 1, { title: 'Updated' });

      expect(result).toEqual(updatedTask);
    });

    it('should return null if task not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await taskService.updateTask(1, 999, { title: 'Ghost' });

      expect(result).toBeNull();
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, status_id: 2 }] });

      const result = await taskService.completeTask(1, 1);

      expect(result.status_id).toBe(2);
    });

    it('should throw error if "Completed" status is missing in DB', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); 

      await expect(taskService.completeTask(1, 1))
        .rejects.toThrow("Status 'Completed' not found");
    });
  });
});