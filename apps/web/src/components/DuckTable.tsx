import type { DuckResponse } from '../api/ducksApi';
import './DuckTable.css';

interface DuckTableProps {
  ducks: DuckResponse[];
  direction: 'asc' | 'desc';
  onToggleSort: () => void;
  onEdit: (duck: DuckResponse) => void;
  onDelete: (duck: DuckResponse) => void;
}

const formatPrice = (duck: DuckResponse): string => {
  return `${duck.price} USD`;
};

export const DuckTable = ({ ducks, direction, onToggleSort, onEdit, onDelete }: DuckTableProps) => {
  return (
    <table className="duck-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>COLOR</th>
          <th>SIZE</th>
          <th>PRICE</th>
          <th onClick={onToggleSort} className="sortable">
            QUANTITY <span className="sort-indicator">{direction === 'asc' ? '▲' : '▼'}</span>
          </th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {ducks.map((duck) => (
          <tr key={duck.id}>
            <td>{duck.id}</td>
            <td>{duck.color}</td>
            <td>{duck.size}</td>
            <td>{formatPrice(duck)}</td>
            <td>{duck.quantity}</td>
            <td className="action-cell">
              <button onClick={() => onEdit(duck)} aria-label="Edit" className="edit-btn">Edit</button>
              <button onClick={() => onDelete(duck)} aria-label="Delete" className="delete-btn">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};