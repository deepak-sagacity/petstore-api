import { IsString, IsInt, IsEnum, IsOptional, IsEmail, MinLength, Min, Max } from 'class-validator';
import { PetType } from '@prisma/client';

export class CreatePetValidation {
  @IsString()
  name!: string;

  @IsEnum(PetType)
  type!: PetType;

  @IsInt()
  @Min(0)
  @Max(50)
  age!: number;

  @IsString()
  breed!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePetValidation {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  age?: number;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateUserValidation {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginValidation {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}