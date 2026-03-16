import { IsOptional, IsString, IsInt, Min, Max, Matches, IsArray } from 'class-validator';

export class UpdateSettingsDto {
  // 뉴스 수집
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(20)
  resultsPerKeyword?: number;

  @IsOptional()
  @IsString()
  dateRestrict?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newsSites?: string[];

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(500)
  summaryMaxLength?: number;

  @IsOptional()
  @IsString()
  llmModel?: string;

  // 뉴스레터 템플릿
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'headerBgColor must be a valid hex color' })
  headerBgColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'badgeColor must be a valid hex color' })
  badgeColor?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;
}
