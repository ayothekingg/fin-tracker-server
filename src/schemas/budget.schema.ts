import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true })
  userId: string;

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
      'Total',
    ],
  })
  category: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  period: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  alertEnabled: boolean;

  @Prop({ default: 80 })
  alertThreshold: number;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
