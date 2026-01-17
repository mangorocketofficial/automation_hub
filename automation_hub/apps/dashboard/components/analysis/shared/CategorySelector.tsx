'use client';

import { cn } from '@/lib/utils';
import { DEFAULT_CATEGORIES, CATEGORY_LABELS, type Category } from '@/types/analysis';

interface CategorySelectorProps {
  selected: Category;
  onChange: (category: Category) => void;
  categories?: Category[];
  showAll?: boolean;
  className?: string;
}

export default function CategorySelector({
  selected,
  onChange,
  categories = DEFAULT_CATEGORIES,
  showAll = false,
  className,
}: CategorySelectorProps) {
  const allCategories = showAll ? ['all', ...categories] : categories;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-zinc-400">카테고리:</span>
      <div className="flex gap-1">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              selected === category
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
          >
            {category === 'all' ? '전체' : CATEGORY_LABELS[category] || category}
          </button>
        ))}
      </div>
    </div>
  );
}
