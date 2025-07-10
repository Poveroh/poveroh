/*
  Warnings:

  - You are about to drop the column `filename` on the `imports` table. All the data in the column will be lost.
  - You are about to drop the column `filetype` on the `imports` table. All the data in the column will be lost.
  - Added the required column `title` to the `imports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "imports" DROP COLUMN "filename",
DROP COLUMN "filetype",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pending_transactions" ADD COLUMN     "status" "ImportStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "import_files" (
    "id" TEXT NOT NULL,
    "import_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" "FileType" NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_files_import_id_idx" ON "import_files"("import_id");

-- AddForeignKey
ALTER TABLE "import_files" ADD CONSTRAINT "import_files_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
