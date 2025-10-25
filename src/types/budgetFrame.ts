export interface BudgetFrame {
  id: string;
  user_id: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  starting_balance: number;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_frame_id: string;
  category_id: string;
  planned_amount: number;
  is_monthly: boolean;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface BudgetFrameWithCategories extends BudgetFrame {
  budget_categories: BudgetCategory[];
}

export interface CreateBudgetFrameInput {
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  starting_balance: number;
  categories?: {
    category_id: string;
    planned_amount: number;
    is_monthly: boolean;
  }[];
}

export interface UpdateBudgetFrameInput {
  id: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  starting_balance?: number;
}

export interface AddCategoryToBudgetInput {
  budget_frame_id: string;
  category_id: string;
  planned_amount: number;
  is_monthly: boolean;
}

export interface UpdateBudgetCategoryInput {
  id: string;
  planned_amount?: number;
  is_monthly?: boolean;
}
