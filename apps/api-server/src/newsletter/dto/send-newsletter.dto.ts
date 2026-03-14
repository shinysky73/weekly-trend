import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize, IsInt } from 'class-validator';

export class SendNewsletterDto {
  @IsString()
  @IsNotEmpty()
  html: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  recipients: string[];

  @IsOptional()
  @IsInt()
  pipelineRunId?: number;
}
