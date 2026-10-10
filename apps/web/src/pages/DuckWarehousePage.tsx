import type { DuckResponse } from '../api/ducksApi';
import { useDucks } from '../hooks/useDucks';
import { DuckTable } from '../components/DuckTable';
import './DuckWarehousePage.css';

export const DuckWarehousePage = () => {
  const { ducks, loading, error, direction, toggleSort } = useDucks();

  const handleAdd = () => {
    // placeholder
  };

  const handleEdit = (_duck: DuckResponse) => {
    // placeholder
  };

  const handleDelete = (_duck: DuckResponse) => {
    // placeholder
  };

  if (loading) return <div className="duck-loading">Loading...</div>;

  if (error) return <div className="duck-error">Error: {error.message}</div>;

  return (
    <div className="duck-warehouse-page">
      <h1>Duck Warehouse</h1>
      <div className="duck-warehouse-page-actions">
        <button onClick={handleAdd}>Add duck</button>
      </div>
      <DuckTable
        ducks={ducks}
        direction={direction}
        onToggleSort={toggleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
