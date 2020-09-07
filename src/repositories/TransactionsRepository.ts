import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (acc, el) => {
        acc[el.type] += Number(el.value);
        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = balance.income - balance.outcome;

    const values: Balance = {
      income: balance.income,
      outcome: balance.outcome,
      total,
    };
    return values;
  }
}

export default TransactionsRepository;
