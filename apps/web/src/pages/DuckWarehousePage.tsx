import type { DuckResponse } from '../api/ducksApi';
import { useDucks } from '../hooks/useDucks';
import { DuckTable } from '../components/DuckTable';
import { DuckForm } from '../components/DuckForm';
import { useState } from 'react';
import { ducksApi } from '../api/ducksApi';
import './DuckWarehousePage.css';

export const DuckWarehousePage = () => {
  const { ducks, loading, error, direction, toggleSort, refresh } = useDucks();
  const [editingDuck, setEditingDuck] = useState<DuckResponse | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingDuck(null);
  };

  const handleEdit = (duck: DuckResponse) => {
    setShowAddForm(true);
    setEditingDuck(duck);
  };

  const handleDelete = async (duck: DuckResponse) => {
    if (window.confirm(`Are you sure you want to delete duck ${duck.id}?`)) {
      try {
        await ducksApi.delete(duck.id);
        refresh();
      } catch (err) {
        alert('Failed to delete duck');
        console.error('Delete error:', err);
      }
    }
  };

  const handleSubmit = async (duckData: Partial<DuckResponse>) => {
    try {
      if (editingDuck) {
        // Update existing duck
        await ducksApi.update(editingDuck.id, {
          price: duckData.price ?? editingDuck.price,
          quantity: duckData.quantity ?? editingDuck.quantity,
          version: editingDuck.version,
        });
      } else {
        // Add new duck
        await ducksApi.create({
          color: duckData.color as DuckResponse['color'],
          size: duckData.size as DuckResponse['size'],
          price: duckData.price as number,
          quantity: duckData.quantity as number,
        });
      }
      refresh();
      setShowAddForm(false);
      setEditingDuck(null);
    } catch (err) {
      alert('Failed to save duck');
      console.error('Save error:', err);
    }
  };

  if (loading) return <div className="duck-loading">Loading...</div>;

  if (error) return <div className="duck-error">Error: {error.message}</div>;

  return (
    <div className="duck-warehouse-page">
      <h1>Duck Warehouse</h1>
      <div className="duck-warehouse-page-actions">
        <button onClick={handleAdd}>Add duck</button>
        {showAddForm && (
          <DuckForm
            onSubmit={handleSubmit}
            isEditing={!!editingDuck}
          />
        )}
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