export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  password: string;
  updatedAt: Date;
  createdAt: Date;
}
