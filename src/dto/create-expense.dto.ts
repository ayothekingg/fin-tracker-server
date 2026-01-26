import {
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsEnum([
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Health',
    'Other',
  ])
  category: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  date?: Date;
}
