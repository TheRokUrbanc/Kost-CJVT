-- CreateEnum
CREATE TYPE "TextSource" AS ENUM ('ORIG', 'CORR');

-- CreateTable
CREATE TABLE "Bibl" (
    "id" TEXT NOT NULL,
    "Topic" TEXT,
    "Instruction" TEXT,
    "AcademicYear" TEXT,
    "TaskSetting" TEXT,
    "CreationDate" TEXT,
    "ProficSlv" TEXT,
    "ProgramType" TEXT,
    "ProgramSubtype" TEXT,
    "Teacher" TEXT,
    "InputType" TEXT,
    "Grade" TEXT,
    "Author" TEXT,
    "Sex" TEXT,
    "YearOfBirth" TEXT,
    "EmploymentStatus" TEXT,
    "CompletedEducation" TEXT,
    "CurrentSchool" TEXT,
    "StudyCycle" TEXT,
    "StudyYear" TEXT,
    "Country" TEXT,
    "FirstLang" TEXT,
    "OtherLang" TEXT,
    "ExpSlv" TEXT,
    "LocSlvLearning" TEXT,
    "DurSlvLearning" TEXT,
    "SloveneTextbooks" TEXT,
    "LifeSlovenia" TEXT,

    CONSTRAINT "Bibl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paragraph" (
    "id" TEXT NOT NULL,
    "type" "TextSource" NOT NULL,
    "biblId" TEXT NOT NULL,
    "origParagraphId" TEXT,

    CONSTRAINT "Paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sentence" (
    "id" TEXT NOT NULL,
    "type" "TextSource" NOT NULL,
    "biblId" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,

    CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "type" "TextSource" NOT NULL,
    "ana" TEXT NOT NULL,
    "lemma" TEXT,
    "text" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Err" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "origWordId" TEXT,
    "corrWordId" TEXT,
    "origParagraphId" TEXT,
    "corrParagraphId" TEXT,

    CONSTRAINT "Err_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiblMeta" (
    "id" SERIAL NOT NULL,
    "colName" TEXT NOT NULL,
    "origCounts" TEXT NOT NULL,
    "origWithErrCounts" TEXT NOT NULL,
    "corrCounts" TEXT NOT NULL,
    "corrWithErrCounts" TEXT NOT NULL,

    CONSTRAINT "BiblMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountMeta" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "origCounts" TEXT NOT NULL,
    "origWithErrCounts" TEXT,
    "corrCounts" TEXT NOT NULL,
    "corrWithErrCounts" TEXT,

    CONSTRAINT "CountMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bibl_TaskSetting_ProficSlv_ProgramType_InputType_FirstLang_idx" ON "Bibl"("TaskSetting", "ProficSlv", "ProgramType", "InputType", "FirstLang");

-- CreateIndex
CREATE UNIQUE INDEX "Paragraph_origParagraphId_key" ON "Paragraph"("origParagraphId");

-- CreateIndex
CREATE INDEX "Word_lemma_text_ana_idx" ON "Word"("lemma", "text", "ana");

-- CreateIndex
CREATE INDEX "Err_type_idx" ON "Err"("type");

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_biblId_fkey" FOREIGN KEY ("biblId") REFERENCES "Bibl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_origParagraphId_fkey" FOREIGN KEY ("origParagraphId") REFERENCES "Paragraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_biblId_fkey" FOREIGN KEY ("biblId") REFERENCES "Bibl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "Paragraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Err" ADD CONSTRAINT "Err_origWordId_fkey" FOREIGN KEY ("origWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Err" ADD CONSTRAINT "Err_corrWordId_fkey" FOREIGN KEY ("corrWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Err" ADD CONSTRAINT "Err_origParagraphId_fkey" FOREIGN KEY ("origParagraphId") REFERENCES "Paragraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Err" ADD CONSTRAINT "Err_corrParagraphId_fkey" FOREIGN KEY ("corrParagraphId") REFERENCES "Paragraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;
