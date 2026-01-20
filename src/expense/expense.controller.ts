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
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { UpdateExpenseDto } from 'src/expense/dto/update-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expenseService.create(createExpenseDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.expenseService.findAllByUser(req.user.userId);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.expenseService.getStatsByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.expenseService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req,
  ) {
    return this.expenseService.update(id, updateExpenseDto, req.user.userId);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.expenseService.remove(id, req.user.userId);
  }
}
