import type { DuckResponse } from '../api/ducksApi';

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
            QUANTITY {direction === 'asc' ? '▲' : '▼'}
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
            <td>
              <button onClick={() => onEdit(duck)}>Edit</button>
              <button onClick={() => onDelete(duck)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};