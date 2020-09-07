import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const findTransaction = await transactionRepository.findOne(id);

    if (!findTransaction) {
      throw new Error('');
    }

    await transactionRepository.remove(findTransaction);
  }
}

export default DeleteTransactionService;
