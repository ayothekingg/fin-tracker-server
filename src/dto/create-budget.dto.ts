import {
  IsNumber,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateBudgetDto {
  @IsEnum([
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Health',
    'Other',
    'Total',
  ])
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  period: string;

  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  alertThreshold?: number;
}
