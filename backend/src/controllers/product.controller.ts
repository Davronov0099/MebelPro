import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response.util';

/**
 * Product controllers
 */

export const productController = {
  /**
   * Get all products
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;

      let products;
      if (search && typeof search === 'string') {
        products = await productService.searchProducts(search);
      } else {
        products = await productService.getAllProducts();
      }

      sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get product by ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.getProductById(id);
      sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new product
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.updateProduct(id, req.body);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await productService.deleteProduct(id);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product quantity
   */
  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        sendError(res, 'Invalid quantity', 400);
        return;
      }

      const product = await productService.updateQuantity(id, quantity);
      sendSuccess(res, product, 'Product quantity updated successfully');
    } catch (error) {
      next(error);
    }
  },
};
