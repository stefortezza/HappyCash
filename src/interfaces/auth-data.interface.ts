export interface AuthData {
  accessToken: string;
  user: {
    sub: string;
    id: string;
    name: string;
    surname: string;
    email: string;
    roles: string[];
  };
}