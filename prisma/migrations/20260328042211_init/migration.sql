/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `volunteer_profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `volunteer_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `volunteer_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "volunteer_profile" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profile_email_key" ON "volunteer_profile"("email");
