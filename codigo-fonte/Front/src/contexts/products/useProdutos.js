import { useContext } from 'react';
import { ProductContext } from './context';

export const useProdutos = () => {
  const context = useContext(ProductContext);
  
  if (!context) {
    throw new Error('useProdutos must be used within a ProductProvider');
  }
  
  return context;
};
