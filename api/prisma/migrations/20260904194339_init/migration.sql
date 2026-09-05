-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "proofUrl" TEXT,
    "proofText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "milestoneId" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confirmedJson" TEXT NOT NULL,
    "unconfirmedJson" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "investorDecision" TEXT NOT NULL DEFAULT 'pending',
    "investorNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Verdict_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Verdict_milestoneId_key" ON "Verdict"("milestoneId");
