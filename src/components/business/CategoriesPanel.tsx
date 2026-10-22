import { useState, type DragEvent, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { useCatalogueCategories, useCategoryMutation } from '../../hooks/business/useCatalogueCategories';
import type { CatalogueCategory } from '../../services/categoriesService';

const iconButton =
  'w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent';

function CategoryRow({
  category,
  index,
  count,
  onMove,
  dragHandlers,
}: {
  category: CatalogueCategory;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  dragHandlers: {
    draggable: true;
    onDragStart: () => void;
    onDragOver: (event: DragEvent) => void;
    onDrop: () => void;
  };
}) {
  const mutation = useCategoryMutation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = name.trim();
    if (!next || next === category.name) {
      setEditing(false);
      return;
    }
    mutation.mutate({ type: 'rename', id: category.id, name: next }, { onSuccess: () => setEditing(false) });
  };

  return (
    <li
      {...dragHandlers}
      className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-canvas border border-border-subtle shadow-sm"
    >
      <div className="flex items-center gap-space-xs">
        <span className="cursor-grab text-text-tertiary hidden lg:flex" aria-hidden="true">
          <Icon name="drag_indicator" className="text-[20px]" />
        </span>
        <span className="w-7 h-7 rounded-md bg-surface-container-low text-text-secondary flex items-center justify-center font-label-sm text-label-sm shrink-0">
          {index + 1}
        </span>
        {editing ? (
          <form className="flex flex-1 items-center gap-space-xs min-w-0" onSubmit={save}>
            <input
              aria-label="Category name"
              className="flex-1 min-w-0 h-9 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
              value={name}
              maxLength={80}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
            <button type="submit" disabled={mutation.isPending} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setName(category.name);
                setEditing(false);
              }}
              className="h-9 px-space-xs rounded-lg text-text-secondary font-label-md text-label-md"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <span className="flex-1 min-w-0 font-label-md text-label-md text-text-primary font-medium truncate">{category.name}</span>
            <button type="button" aria-label={`Move ${category.name} up`} className={iconButton} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
              <Icon name="arrow_upward" className="text-[18px]" />
            </button>
            <button
              type="button"
              aria-label={`Move ${category.name} down`}
              className={iconButton}
              disabled={index === count - 1}
              onClick={() => onMove(index, index + 1)}
            >
              <Icon name="arrow_downward" className="text-[18px]" />
            </button>
            <button type="button" aria-label={`Rename ${category.name}`} className={iconButton} onClick={() => setEditing(true)}>
              <Icon name="edit" className="text-[18px]" />
            </button>
            <button type="button" aria-label={`Delete ${category.name}`} className={`${iconButton} hover:text-red-600`} onClick={() => setConfirmDelete(true)}>
              <Icon name="delete" className="text-[18px]" />
            </button>
          </>
        )}
      </div>
      {confirmDelete ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs justify-between rounded-lg bg-error-container/60 p-space-sm">
          <span className="font-caption text-caption text-on-error-container">
            Delete “{category.name}”? Items in it stay in your catalogue, uncategorised.
          </span>
          <div className="flex gap-space-xs">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ type: 'remove', id: category.id })}
              className="h-8 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm"
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="h-8 px-space-sm rounded-lg bg-surface-canvas font-label-sm text-label-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {mutation.isError ? <span className="font-caption text-caption text-red-600">{mutation.error.message}</span> : null}
    </li>
  );
}

/** Catalogue categories: their order drives the customer menu and POS grid. */
export function CategoriesPanel() {
  const categories = useCatalogueCategories();
  const mutation = useCategoryMutation();
  const [newName, setNewName] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const rows = categories.data ?? [];

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const ids = rows.map((c) => c.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    mutation.mutate({ type: 'reorder', orderedIds: ids });
  };

  const add = (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    mutation.mutate({ type: 'create', name }, { onSuccess: () => setNewName('') });
  };

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      <form onSubmit={add} className="flex gap-space-xs">
        <input
          aria-label="New category name"
          placeholder="New category, e.g. Breakfast"
          maxLength={80}
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          className="flex-1 min-w-0 h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
        />
        <button
          type="submit"
          disabled={!newName.trim() || mutation.isPending}
          className="h-11 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Icon name="add" className="text-[18px]" /> Add
        </button>
      </form>
      {mutation.isError ? <span className="font-caption text-caption text-red-600">{mutation.error.message}</span> : null}

      <div className="flex items-start gap-space-xs rounded-xl bg-surface-tint-blue p-space-sm text-primary">
        <Icon name="info" className="text-[18px] mt-0.5" />
        <span className="font-caption text-caption">
          Customers see categories in this order on your storefront menu and in the POS grid. Drag rows or use the arrows to reorder.
        </span>
      </div>

      {categories.isLoading ? (
        <LoadingRows rows={4} label="Loading categories" />
      ) : categories.isError ? (
        <ErrorState title="Could not load categories" error={categories.error} onRetry={() => categories.refetch()} />
      ) : !rows.length ? (
        <EmptyState icon="category" title="No categories yet" body="Add your first category to group products and services on your menu." />
      ) : (
        <ol className="flex flex-col gap-space-xs">
          {rows.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              index={index}
              count={rows.length}
              onMove={move}
              dragHandlers={{
                draggable: true,
                onDragStart: () => setDragIndex(index),
                onDragOver: (event) => event.preventDefault(),
                onDrop: () => {
                  if (dragIndex !== null) move(dragIndex, index);
                  setDragIndex(null);
                },
              }}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
