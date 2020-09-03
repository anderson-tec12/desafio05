// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import Category from '../models/Category';

interface Reqquest {
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
  }: Reqquest): Promise<any> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const id = async () => {
      const checkExitsCategory = await categoryRepository.findOne({
        where: { title: category },
      });

      let dataCategory: any = '';

      if (!checkExitsCategory) {
        const newCategory = await categoryRepository.create({
          title: category,
        });

        dataCategory = await categoryRepository.save(newCategory);
      } else {
        dataCategory = checkExitsCategory;
      }
      const { id } = dataCategory;

      return id;
    };

    const ID = await id();

    const TRANSACTION = async (id: any) => {
      console.log('########################', id);
      const newTransaction = transactionRepository.create({
        type,
        value,
        title,
        category_id: id,
      });

      const transaction = await transactionRepository.save(newTransaction);
      return transaction;
    };

    return TRANSACTION(ID);
  }
}

export default CreateTransactionService;
