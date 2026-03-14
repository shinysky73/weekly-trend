import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKeywordDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
