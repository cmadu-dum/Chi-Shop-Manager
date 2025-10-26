import { Router, Request, Response } from 'express';
import { supabase } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const products = data.map(product => ({
      id: product.id,
      name: product.name,
      purchasePrice: Number(product.purchase_price),
      sellingPrice: Number(product.selling_price),
      stock: product.stock
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, purchasePrice, sellingPrice, stock } = req.body;

    if (!name || purchasePrice === undefined || sellingPrice === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        stock
      })
      .select()
      .single();

    if (error) throw error;

    const product = {
      id: data.id,
      name: data.name,
      purchasePrice: Number(data.purchase_price),
      sellingPrice: Number(data.selling_price),
      stock: data.stock
    };

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, purchasePrice, sellingPrice, stock } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (purchasePrice !== undefined) updates.purchase_price = purchasePrice;
    if (sellingPrice !== undefined) updates.selling_price = sellingPrice;
    if (stock !== undefined) updates.stock = stock;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const product = {
      id: data.id,
      name: data.name,
      purchasePrice: Number(data.purchase_price),
      sellingPrice: Number(data.selling_price),
      stock: data.stock
    };

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
