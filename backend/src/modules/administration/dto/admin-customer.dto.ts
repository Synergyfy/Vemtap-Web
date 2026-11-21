import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCustomerFilterDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by name, code, email or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by cluster name or identifier' })
  @IsOptional()
  @IsString()
  cluster?: string;

  @ApiPropertyOptional({ description: 'Filter by account status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by joined date timeframe (week, month, q1, all)' })
  @IsOptional()
  @IsString()
  joined?: string;
}

export class AdminUpdateCustomerStatusDto {
  @ApiProperty({ example: 'Suspended', enum: ['Active', 'Suspended', 'Pending', 'Dormant'] })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ example: 'Suspended due to security verification issue' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminCustomerNoteDto {
  @ApiProperty({ example: 'High-value customer. Frequent shopper at Lekki.' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
