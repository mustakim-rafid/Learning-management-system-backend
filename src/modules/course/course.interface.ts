export type TCreateCourse = {
  title: string;
  description?: string;
  categoryId?: string;
  price?: number;
  isPaid?: boolean;
  thumbnailUrl?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type TUpdateCourse = Partial<TCreateCourse>;