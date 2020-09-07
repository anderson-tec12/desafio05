import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';

import { getRepository, getCustomRepository, In } from 'typeorm';

import CreateTransactionService from '../services/CreateTransactionService';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';
import uploadConfig from '../config/uploads';

interface Request {
  filename: string;
}

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
//Promise<Transaction[]>
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);
    const csvFilePath = path.join(uploadConfig.directory, filename);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      console.log('ITEM = ', line);

      // const dataArray = line.map((palavra: any) => {
      //   const wordsArray = palavra.split(',');
      //   console.log(wordsArray);
      //   return wordsArray;
      // });
      const dataArray = line;

      const [title, type, value, category] = dataArray;

      // console.log(title, type, value, category);
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });

      // console.log('a', transactions);
      // console.log('b', categories);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitle.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransections = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransections);

    await fs.promises.unlink(csvFilePath);
    console.log(transactions);
    console.log(existentCategoriesTitle);
    console.log(addCategoryTitle);

    return createdTransections;

    // return;
    //{
    // console.log(filename);
    // //obtendo o caminho do arquivo
    // const csvFilePath = path.join(uploadConfig.directory, filename);
    // console.log('Caminho do arquivo', csvFilePath);
    // const readCSVStream = fs.createReadStream(csvFilePath);
    // console.log(readCSVStream);
    // // removendo  a primeira linha
    // const parseStream = csvParse({
    //   from_line: 2,
    //   ltrim: true,
    //   rtrim: true,
    // });
    // const parseCSV = readCSVStream.pipe(parseStream);
    // parseCSV.on('data', line => {
    //   console.log('ITEM = ', line);
    // });
    // parseCSV.on('end', () => {
    //   console.log('Leitura do CSV finalizada');
    // });
    //}
    // const categoriesRepository = getRepository(Category);
    // const TransactionsR = getRepository(Transaction);
    // async function loadCSV(csvFilePath: string) {
    //   const readCSVStream = fs.createReadStream(csvFilePath);
    //   const parseStream = csvParse({
    //     from_line: 2,
    //     ltrim: true,
    //     rtrim: true,
    //   });
    //   const parseCSV = readCSVStream.pipe(parseStream);
    //   const Transactions: TransactionCSV[] = [];
    //   parseCSV.on('data', async line => {
    //     const dataArray = line.map((palavra: any) => {
    //       const wordsArray = palavra.split(',');
    //       return wordsArray;
    //     });
    //     const [title, type, value, category] = dataArray[0];
    //     if (!title || !type || !value || !category) {
    //       throw new Error('File CSV is incorrect');
    //     }
    //     // const createTransaction = new CreateTransactionService();
    //     // const transaction = await createTransaction.execute({
    //     //   title,
    //     //   value,
    //     //   type,
    //     //   category,
    //     // });
    //     Transactions.push({ title, type, value, category });
    //   });
    //   await new Promise(resolve => {
    //     parseCSV.on('end', resolve);
    //   });
    //   return Transactions;
    // }
    // console.log(filename);
    // //obtendo o caminho do arquivo
    // const csvFilePath = path.join(uploadConfig.directory, filename);
    // const data = await loadCSV(csvFilePath);
    // const createTransaction = new CreateTransactionService();
    // const t: Transaction[] = [];
    // for (let i = 0; i < data.length; i++) {
    //   const { title, value, type, category } = data[i];
    //   const transaction = await createTransaction.execute({
    //     title,
    //     value,
    //     type,
    //     category,
    //   });
    //   t.push(transaction);
    // }
    // console.log(t);
    // return t;
  }
}

export default ImportTransactionsService;
