import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';

//model
import Transaction from '../models/Transaction';
import Category from '../models/Category';

//repositories
import TransactionRepository from '../repositories/TransactionsRepository';
interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('is error');
    }

    const checkExitsCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkExitsCategory) {
      const createCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(createCategory);

      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category_id: createCategory.id,
      });

      await transactionRepository.save(transaction);
      return transaction;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: checkExitsCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
    // const id = async () => {
    //   let dataCategory: any = '';

    //   if (!checkExitsCategory) {
    //     const newCategory = await categoryRepository.create({
    //       title: category,
    //     });

    //     dataCategory = await categoryRepository.save(newCategory);
    //   } else {
    //     dataCategory = checkExitsCategory;
    //   }
    //   const { id } = dataCategory;

    //   return id;
    // };

    // const ID = await id();

    // const TRANSACTION = async (id: any) => {
    //   console.log('########################', id);
    //   const newTransaction = transactionRepository.create({
    //     type,
    //     value,
    //     title,
    //     category_id: id,
    //   });

    //   const transaction = await transactionRepository.save(newTransaction);
    //   return transaction;
    // };

    // return TRANSACTION(ID);
  }
}

export default CreateTransactionService;
