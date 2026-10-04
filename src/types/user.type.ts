export enum UserType {
  Regular = 'regular',
  Pro = 'pro'
}

export type User = {
  name: string;
  email: string;
  avatarPath?: string;
  password: string;
  type: UserType;
};
