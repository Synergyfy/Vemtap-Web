import { ApiProperty } from '@nestjs/swagger';

export class StatTrendDto {
  @ApiProperty({ example: '+12%' })
  value: string;

  @ApiProperty({ example: true })
  isUp: boolean;
}

export class StatCardDto {
  @ApiProperty({ example: 'Total Visitors' })
  label: string;

  @ApiProperty({ example: '2,847' })
  value: string;

  @ApiProperty({ example: 'group' })
  icon: string;

  @ApiProperty({ example: 'blue' })
  color: string;

  @ApiProperty({ type: StatTrendDto, required: false })
  trend?: StatTrendDto;
}

export class VisitorStatsResponseDto {
  @ApiProperty({ type: [StatCardDto] })
  stats: StatCardDto[];
}
