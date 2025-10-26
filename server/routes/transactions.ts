import { Router, Request, Response } from 'express';
import { supabase } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    const transactions = data.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      productId: transaction.product_id,
      quantity: transaction.quantity,
      profit: transaction.profit ? Number(transaction.profit) : undefined
    }));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, amount, description, category, date, productId, quantity, profit } = req.body;

    if (!type || amount === undefined || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type,
        amount,
        description,
        category,
        date: date || new Date().toISOString(),
        product_id: productId,
        quantity,
        profit
      })
      .select()
      .single();

    if (error) throw error;

    const transaction = {
      id: data.id,
      type: data.type,
      amount: Number(data.amount),
      description: data.description,
      category: data.category,
      date: data.date,
      productId: data.product_id,
      quantity: data.quantity,
      profit: data.profit ? Number(data.profit) : undefined
    };

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
