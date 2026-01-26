import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetService.create(createBudgetDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req, @Query('period') period?: string) {
    return this.budgetService.findAllByUser(req.user.userId, period);
  }

  @Get('status/current')
  getCurrentMonthStatus(@Request() req) {
    return this.budgetService.getCurrentMonthBudgets(req.user.userId);
  }

  @Get('status/:period')
  getBudgetStatus(@Param('period') period: string, @Request() req) {
    return this.budgetService.getBudgetStatus(req.user.userId, period);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.budgetService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Request() req,
  ) {
    return this.budgetService.update(id, updateBudgetDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.budgetService.remove(id, req.user.userId);
  }

  @Post('set-total')
  setTotalBudget(
    @Body() body: { totalBudget: number; period: string },
    @Request() req,
  ) {
    return this.budgetService.setTotalBudget(
      body.totalBudget,
      body.period,
      req.user.userId,
    );
  }
}
