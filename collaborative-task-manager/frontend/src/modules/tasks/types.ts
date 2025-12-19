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
  status: 'ToDo' | 'InProgress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  creator: User;
  assignedTo?: null | User ;
  createdById: string; 
  
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority: Task['priority'];
  status: Task['status'];
  assignedToId?: string | null;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}