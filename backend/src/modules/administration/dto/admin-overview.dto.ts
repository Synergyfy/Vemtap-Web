import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum OverviewTimeframe {
  TODAY = 'today',
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
}

export class AdminOverviewQueryDto {
  @ApiPropertyOptional({
    enum: OverviewTimeframe,
    default: OverviewTimeframe.TODAY,
    description: 'Timeframe window for telemetry calculations',
  })
  @IsOptional()
  @IsEnum(OverviewTimeframe)
  timeframe?: OverviewTimeframe = OverviewTimeframe.TODAY;
}
