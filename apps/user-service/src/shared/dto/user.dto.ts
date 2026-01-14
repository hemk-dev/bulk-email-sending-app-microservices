export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}
