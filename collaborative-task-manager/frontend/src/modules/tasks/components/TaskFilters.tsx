import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export const TaskFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: TaskFiltersProps) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Review', label: 'Review' },
    { value: 'Completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' },
  ];

  const sortOptions = [
    { value: 'dueDate-asc', label: 'Due Date (Earliest First)' },
    { value: 'dueDate-desc', label: 'Due Date (Latest First)' },
    { value: 'priority-asc', label: 'Priority (Low to High)' },
    { value: 'priority-desc', label: 'Priority (High to Low)' },
    { value: 'createdAt-desc', label: 'Recently Created' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            label="Search Tasks"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* FIXED: Pass value directly, not event object */}
        <Select
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange} // Just the function, not wrapper
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={priorityFilter}
          onChange={onPriorityFilterChange} // Just the function, not wrapper
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange} // Just the function, not wrapper
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-600"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};