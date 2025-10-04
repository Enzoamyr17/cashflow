export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}
