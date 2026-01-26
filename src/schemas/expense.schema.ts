import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: [
      'Food',
      'Transport',
      'Entertainment',
      'Utilities',
      'Shopping',
      'Health',
      'Other',
    ],
  })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  userId: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
