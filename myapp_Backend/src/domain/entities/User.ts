export type Role = "admin" | "member" | "viewer";

export interface User {
  _id: string;
  email: string;
  password: string;
  role: Role;
}
