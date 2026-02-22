/*
  Warnings:

  - The values [PDF] on the enum `LessonContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LessonContentType_new" AS ENUM ('VIDEO', 'TEXT');
ALTER TABLE "lessons" ALTER COLUMN "contentType" TYPE "LessonContentType_new" USING ("contentType"::text::"LessonContentType_new");
ALTER TYPE "LessonContentType" RENAME TO "LessonContentType_old";
ALTER TYPE "LessonContentType_new" RENAME TO "LessonContentType";
DROP TYPE "public"."LessonContentType_old";
COMMIT;
