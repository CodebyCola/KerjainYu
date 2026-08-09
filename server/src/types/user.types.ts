export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  password: string;
  updated_at: Date;
  created_at: Date;
}
