import { Router, Request, Response } from 'express';
import { supabase } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const newStock = product.stock - quantity;
    const saleAmount = Number(product.selling_price) * quantity;
    const profit = (Number(product.selling_price) - Number(product.purchase_price)) * quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'sale',
        amount: saleAmount,
        description: `Sold ${quantity} x ${product.name}`,
        category: 'Product Sale',
        date: new Date().toISOString(),
        product_id: productId,
        quantity,
        profit
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    const updatedProduct = {
      id: product.id,
      name: product.name,
      purchasePrice: Number(product.purchase_price),
      sellingPrice: Number(product.selling_price),
      stock: newStock
    };

    const createdTransaction = {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      productId: transaction.product_id,
      quantity: transaction.quantity,
      profit: Number(transaction.profit)
    };

    res.status(201).json({
      product: updatedProduct,
      transaction: createdTransaction
    });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Failed to process sale' });
  }
});

export default router;
