import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFilterKeywordDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
