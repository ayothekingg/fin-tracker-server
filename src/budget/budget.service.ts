import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { Budget, BudgetDocument } from '../schemas/budget.schema';
import { Expense, ExpenseDocument } from '../schemas/expense.schema';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(
    createBudgetDto: CreateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    // Check if budget already exists for this category and period
    const existing = await this.budgetModel.findOne({
      userId,
      category: createBudgetDto.category,
      period: createBudgetDto.period,
    });

    if (existing) {
      // Update existing budget
      Object.assign(existing, createBudgetDto);
      return (existing as BudgetDocument).save();
    }

    const budget = new this.budgetModel({
      ...createBudgetDto,
      userId,
    });
    return (budget as BudgetDocument).save();
  }

  async findAllByUser(userId: string, period?: string): Promise<Budget[]> {
    const query: any = { userId };
    if (period) {
      query.period = period;
    }
    return this.budgetModel.find(query).exec();
  }

  async findOne(id: string, userId: string): Promise<Budget> {
    const budget = await this.budgetModel.findById(id).exec();

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }

    return budget;
  }

  async update(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    const budget = await this.findOne(id, userId);
    Object.assign(budget, updateBudgetDto);
    return (budget as BudgetDocument).save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const budget = await this.findOne(id, userId);
    await this.budgetModel.deleteOne({ _id: id });
  }

  async getBudgetStatus(userId: string, period: string) {
    const budgets = await this.findAllByUser(userId, period);

    // Get expenses for the period
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const expenses = await this.expenseModel
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .exec();

    // Calculate spending by category
    const spendingByCategory: { [key: string]: number } = {};
    let totalSpending = 0;

    expenses.forEach((expense) => {
      spendingByCategory[expense.category] =
        (spendingByCategory[expense.category] || 0) + expense.amount;
      totalSpending += expense.amount;
    });

    // Build budget status for each category
    const budgetStatus = budgets.map((budget) => {
      const spent =
        budget.category === 'Total'
          ? totalSpending
          : spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const isOverBudget = spent > budget.amount;
      const isNearLimit = percentUsed >= budget.alertThreshold;

      return {
        budget,
        spent,
        remaining,
        percentUsed,
        isOverBudget,
        isNearLimit: budget.alertEnabled && isNearLimit && !isOverBudget,
        alerts: this.generateAlerts(budget, spent, percentUsed),
      };
    });

    return {
      period,
      budgets: budgetStatus,
      totalBudget: budgets.find((b) => b.category === 'Total')?.amount || 0,
      totalSpent: totalSpending,
      summary: {
        totalCategories: budgets.length,
        overBudgetCount: budgetStatus.filter((b) => b.isOverBudget).length,
        nearLimitCount: budgetStatus.filter((b) => b.isNearLimit).length,
      },
    };
  }

  private generateAlerts(
    budget: Budget,
    spent: number,
    percentUsed: number,
  ): string[] {
    const alerts: string[] = [];

    if (!budget.alertEnabled) return alerts;

    if (spent > budget.amount) {
      const overage = spent - budget.amount;
      alerts.push(
        `Over budget by ₦${overage.toFixed(2)} (${(percentUsed - 100).toFixed(1)}%)`,
      );
    } else if (percentUsed >= budget.alertThreshold) {
      alerts.push(`${percentUsed.toFixed(1)}% of budget used`);
    }

    return alerts;
  }

  async getCurrentMonthBudgets(userId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getBudgetStatus(userId, period);
  }

  async setTotalBudget(
    totalBudget: number,
    period: string,
    userId: string,
  ): Promise<Budget> {
    // Check if total budget already exists for this period
    const existing = await this.budgetModel.findOne({
      userId,
      category: 'Total',
      period,
    });

    if (existing) {
      // Update existing total budget
      existing.amount = totalBudget;
      return (existing as BudgetDocument).save();
    }

    // Create new total budget
    const totalBudgetDoc = new this.budgetModel({
      userId,
      category: 'Total',
      amount: totalBudget,
      period,
      alertEnabled: false,
    });
    return (totalBudgetDoc as BudgetDocument).save();
  }
}
