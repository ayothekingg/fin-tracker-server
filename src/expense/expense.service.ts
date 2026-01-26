import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from 'src/dto/create-expense.dto';
import { UpdateExpenseDto } from 'src/dto/update-expense.dto';
import { Expense, ExpenseDocument } from 'src/schemas/expense.schema';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(
    CreateExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<ExpenseDocument> {
    const expense = new this.expenseModel({
      ...CreateExpenseDto,
      userId,
    });
    return expense.save();
  }

  async findAllByUser(userId: string): Promise<ExpenseDocument[]> {
    return this.expenseModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<ExpenseDocument> {
    const expense = await this.expenseModel.findById(id).exec();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }
    return expense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ): Promise<ExpenseDocument> {
    const expense = await this.findOne(id, userId);

    Object.assign(expense, updateExpenseDto);
    return expense.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    await expense.deleteOne();
  }
  async getStatsByUser(userId: string) {
    const expenses = await this.findAllByUser(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const thisMonth = expenses
      .filter((exp) => new Date(exp.date) >= startOfMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const thisWeek = expenses
      .filter((exp) => new Date(exp.date) >= startOfWeek)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const averageExpense =
      expenses.length > 0 ? totalSpent / expenses.length : 0;

    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    return {
      totalSpent,
      thisMonth,
      thisWeek,
      averageExpense,
      categoryBreakdown,
      totalExpenses: expenses.length,
    };
  }
}
