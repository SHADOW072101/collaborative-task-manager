export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  creator: User;
  assignedTo?: User;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority: Task['priority'];
  status: Task['status'];
  assignedToId?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}