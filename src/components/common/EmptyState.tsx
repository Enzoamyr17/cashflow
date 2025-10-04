import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
