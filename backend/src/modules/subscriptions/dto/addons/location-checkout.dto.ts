import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartLocationCheckoutDto {
  @ApiProperty({
    description: 'Admin-configured location add-on to purchase',
    example: 'uuid-addon-extra-location',
  })
  @IsString()
  @IsNotEmpty()
  addonId: string;

  @ApiProperty({
    description:
      'Number of location slots to add. Must be a multiple of the add-on location size.',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  locations: number;

  @ApiPropertyOptional({
    description:
      'Where Paystack returns the customer after paying (web URL or the app link vemtap://payments/return)',
    example: 'https://app.vemtap.com/business/hub/locations/buy',
  })
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    protocols: ['http', 'https', 'vemtap'],
  })
  callbackUrl?: string;
}
