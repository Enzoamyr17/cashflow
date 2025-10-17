export interface Category {
  id: string;
  name: string;
  color: string | null;
  planned_amount?: number | null;
  is_budgeted?: boolean;
  is_monthly?: boolean;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string | null;
  planned_amount?: number | null;
  is_budgeted?: boolean;
  is_monthly?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
  planned_amount?: number | null;
  is_budgeted?: boolean;
  is_monthly?: boolean;
}
