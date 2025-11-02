import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  profilePhoto?: Buffer | null;

  @IsOptional()
  @IsString()
  profilePhotoMimeType?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}