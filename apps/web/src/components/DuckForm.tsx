import { useState } from 'react';
import type { DuckResponse } from '../api/ducksApi';

interface DuckFormProps {
  onSubmit: (duck: Partial<DuckResponse>) => void;
  isEditing?: boolean;
}

export const DuckForm = ({ onSubmit, isEditing = false }: DuckFormProps) => {
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!color || !size || !price || !quantity) {
      alert('Please fill all fields (color, size, price, quantity).');
      return;
    }
    const priceNum = Number(price);
    const qtyNum = Number(quantity);
    if (priceNum <= 0 || !Number.isInteger(qtyNum)) {
      alert('Price must be positive and quantity must be a whole number.');
      return;
    }
    // Type assertion to match DuckResponse enum types
    const validColor = color.trim() as DuckResponse['color'];
    const validSize = size.trim() as DuckResponse['size'];

    onSubmit({
      color: validColor,
      size: validSize,
      price: parseFloat(price),
      quantity: qtyNum,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="duck-form">
      <div>
        <label htmlFor="color">Color:</label>
        <select id="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={isEditing}>
          <option value="">Select color</option>
          <option value="Red">Red</option>
          <option value="Green">Green</option>
          <option value="Yellow">Yellow</option>
          <option value="Black">Black</option>
        </select>
      </div>
      <div>
        <label htmlFor="size">Size:</label>
        <select id="size" value={size} onChange={(e) => setSize(e.target.value)} disabled={isEditing}>
          <option value="">Select size</option>
          <option value="XLarge">XLarge</option>
          <option value="Large">Large</option>
          <option value="Medium">Medium</option>
          <option value="Small">Small</option>
          <option value="XSmall">XSmall</option>
        </select>
      </div>
      <div>
        <label htmlFor="price">Price ($):</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          step="1"
        />
      </div>
      <button type="submit">Add Duck</button>
    </form>
  );
};