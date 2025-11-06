import { User } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    avatarColor: '#3b82f6',
    initials: 'JD',
  },
  {
    id: 'user2',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'Member',
    avatarColor: '#10b981',
    initials: 'AJ',
  },
  {
    id: 'user3',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    role: 'Member',
    avatarColor: '#f59e0b',
    initials: 'BW',
  },
];