import { User } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user0',
    name: 'Eve Smith',
    email: 'eve.s@example.com',
    role: 'Super Admin',
    avatarColor: '#ef4444',
    initials: 'ES',
  },
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
    role: 'Manager',
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
