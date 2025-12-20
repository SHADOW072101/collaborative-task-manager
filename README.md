🚀 Collaborative Task Manager

A modern, full-stack task management application with real-time collaboration features. Built with React, TypeScript, Node.js, Express, PostgreSQL, Prisma & WebSocket integration.
```
📁 Folder Structure
collaborative-task-manager
│
├── backend
│   │
│   ├── .env                      ← not pushed to Git, keep example only
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── prisma.config.ts
│   ├── test-jwt.js
│   │
│   ├── logs/                     ← optional to push
│   │   ├── all.log
│   │   └── error.log
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   │   └── (migration folders/files…)
│   │   └── client/
│   │       ├── default.js
│   │       ├── default.d.ts
│   │       ├── index.js
│   │       ├── index.d.ts
│   │       └── query_engine-windows.dll.node
│   │
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   │
│   │   ├── routes/
│   │   │   └── (all route files)
│   │   │
│   │   ├── controllers/
│   │   │   └── (*.controller.ts)
│   │   │
│   │   ├── middlewares/
│   │   │   └── (*.ts)
│   │   │
│   │   ├── services/
│   │   │   └── (*.ts)
│   │   │
│   │   ├── utils/
│   │   │   └── (*.ts)
│   │   │
│   │   └── config/
│   │       └── prisma.client.ts
│   │
│   └── tests/
│       └── test-jwt.js
│
│
├── frontend
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.js
│   │
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       │
│       ├── components/
│       │   └── (*.tsx)
│       │
│       ├── pages/
│       │   └── (*.tsx)
│       │
│       ├── context/
│       │   └── (*.ts)
│       │
│       └── styles/
│           └── (*.css | *.scss)
│
│
└── README.md
```
📌 Status & Technologies








📋 Table of Contents

Features

Architecture

Complex Functions Explained

Installation

Configuration

Deployment

API Documentation

Testing

Troubleshooting

Contributing

License

Acknowledgments

✨ Features
🔐 Authentication & Security

JWT authentication

Refresh tokens

Role-based access control

Password hashing with bcrypt

Two-factor authentication

Session management

📊 Task Management

CRUD tasks

Drag & drop

Filtering & search

Priority levels

Status flow

Real-time updating

👥 Collaboration

WebSockets

Mentions

Comments

File attachments

Audit logs

Team structure

📱 UX

Tailwind UI

Notifications

Dashboard charts

Dark/Light mode

Keyboard shortcuts

Deadline reminders

🏗️ Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Auth Module   │  │   Tasks Module  │             │
│  └─────────────────┘  └─────────────────┘             │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Users Module  │  │ Notifications   │             │
│  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
                           │
                  REST API │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Auth    │  │  Tasks   │  │  Users   │             │
│  │ Service  │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌─────────────────────────┐             │
│  │ Socket   │  │    Database (Prisma)    │             │
│  │ Server   │  │                         │             │
│  └──────────┘  └─────────────────────────┘             │
└─────────────────────────────────────────────────────────┘

```

🧠 Complex Functions — Full Code Included
1️⃣ Real-time Task Synchronization (WebSocket)
`
export const setupSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) return next(new Error('Authentication error'));
      
      socket.data.user = user;
      socket.join(`user:${user.id}`);
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.data.user.name} connected`);
    
    // Real-time task updates
    socket.on('task:update', async (taskId, updates) => {
      const updatedTask = await taskService.updateTask(taskId, updates);
      
      // Emit to task room and assignee
      io.to(`task:${taskId}`).emit('task:updated', updatedTask);
      if (updatedTask.assignedToId) {
        io.to(`user:${updatedTask.assignedToId}`).emit('task:assigned', updatedTask);
      }
    });
  });
};
`

2️⃣ Advanced Task Filtering with Prisma
`
async getTasks(filters: TaskFilters, userId: string) {
  // Start with base conditions: user can see tasks they created OR are assigned to
  const baseCondition: Prisma.TaskWhereInput = {
    OR: [
      { creatorId: userId },
      { assignedToId: userId },
    ]
  };

  // Dynamically build filter conditions
  const filterConditions: Prisma.TaskWhereInput[] = [];

  if (filters.search) {
    filterConditions.push({
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    });
  }

  // Combine using Prisma's AND operator for complex queries
  const where: Prisma.TaskWhereInput = filterConditions.length > 0
    ? {
        AND: [
          baseCondition,
          ...filterConditions,
        ]
      }
    : baseCondition;

  return prisma.task.findMany({
    where,
    include: { creator: true, assignedTo: true },
    orderBy: this.getSortOrder(filters.sortBy),
  });
}
`

3️⃣ React Query Data Sync
`
export const useTasks = (options: UseTasksOptions = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', options, user?.id],
    queryFn: async () => {
      // Optimistic UI updates with background refetch
      const params = new URLSearchParams();
      if (options.view) params.append('view', options.view);
      if (options.search) params.append('search', options.search);
      
      const response = await taskService.getTasks(params);
      
      // Cache normalization
      queryClient.setQueryData(['tasks', 'all'], response.data);
      
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    // Real-time updates via WebSocket
    onSuccess: (data) => {
      socket.on('task:updated', (updatedTask) => {
        queryClient.setQueryData(['tasks', options], (old: any) => 
          old.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      });
    },
  });
};
`

4️⃣ Zod Schema Validation
`const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform(val => val.trim()),
  
  description: z.string()
    .max(5000, 'Description too long')
    .optional()
    .transform(val => val?.trim()),
  
  dueDate: z.string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'Due date must be in the future')
    .transform(val => new Date(val)),
  
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .default('MEDIUM'),
  
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])
    .default('TODO'),
  
  assignedToId: z.string()
    .cuid('Invalid user ID format')
    .optional()
    .refine(async (id) => {
      if (!id) return true;
      const user = await prisma.user.findUnique({ where: { id } });
      return !!user;
    }, 'User does not exist'),
}).refine((data) => {
  // Custom validation: High/Urgent tasks must have due dates
  if (['HIGH', 'URGENT'].includes(data.priority) && !data.dueDate) {
    return false;
  }
  return true;
}, 'High priority tasks require due dates');`

5️⃣ Dashboard Data Aggregation
`
export const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../../uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and document files are allowed'));
  }
});

// Image processing with sharp
export const processImage = async (filePath: string) => {
  return sharp(filePath)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
};
`

🛠️ Installation
Backend
git clone https://github.com/yourusername/task-manager.git
cd task-manager/backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run dev

Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev

⚙️ Configuration
Backend (.env)
DATABASE_URL=
JWT_SECRET=
PORT=
FRONTEND_URL=

Frontend (.env)
VITE_API_URL=

🚀 Deployment
Vercel + Neon
vercel deploy

Docker
[ FULL YAML INCLUDED ABOVE — no edits ]

📚 API Documentation
Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

Tasks
GET /api/tasks
POST /api/tasks
GET /api/tasks/:id
PUT /api/tasks/:id
DELETE /api/tasks/:id
PATCH /api/tasks/:id/status
POST /api/tasks/:id/assign

WebSockets
task:created
task:updated
task:deleted
task:assigned
notification:new

🧪 Testing
cd backend
npm test
npm run test:coverage

cd frontend
npm test
npm run test:e2e

npm run test:all

🔧 Troubleshooting
Database
sudo service postgresql status
psql -h localhost -U postgres -d taskmanager
npx prisma migrate reset

WebSocket Testing
const ws = new WebSocket('ws://localhost:3000');

Build Errors
npm cache clean --force
rm -rf node_modules
npm install

🤝 Contributing

Fork repo

Make feature branch

Commit changes

Submit PR

Guidelines:

TS strict mode

Unit tests required

Update docs

Follow formatting style

📄 License

MIT Licensed — see LICENSE file.

🙏 Acknowledgments

Prisma ORM

Tailwind CSS

Socket.IO

React Query
