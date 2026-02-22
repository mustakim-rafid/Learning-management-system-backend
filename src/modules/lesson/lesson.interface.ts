export type CreateLessonDTO = {
  title: string;
  contentType: "VIDEO" | "TEXT";
  contentUrl?: string | null; 
  contentText?: string | null; 
  duration?: number | null; 
  order?: number | null; 
  isPreview?: boolean;
};