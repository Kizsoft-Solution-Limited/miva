-- Redefine Verdict for versioned history; add proof file fields on Milestone.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "proofUrl" TEXT,
    "proofText" TEXT,
    "proofFileName" TEXT,
    "proofMime" TEXT,
    "proofData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Milestone" ("id", "title", "claim", "founderName", "proofType", "proofUrl", "proofText", "createdAt", "updatedAt")
SELECT "id", "title", "claim", "founderName", "proofType", "proofUrl", "proofText", "createdAt", "updatedAt" FROM "Milestone";

DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";

CREATE TABLE "new_Verdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "milestoneId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confirmedJson" TEXT NOT NULL,
    "unconfirmedJson" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "checkJson" TEXT,
    "investorDecision" TEXT NOT NULL DEFAULT 'pending',
    "investorNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Verdict_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Verdict" ("id", "milestoneId", "version", "recommendation", "summary", "confirmedJson", "unconfirmedJson", "reasoning", "investorDecision", "investorNote", "createdAt", "updatedAt")
SELECT "id", "milestoneId", 1, "recommendation", "summary", "confirmedJson", "unconfirmedJson", "reasoning", "investorDecision", "investorNote", "createdAt", "updatedAt" FROM "Verdict";

DROP TABLE "Verdict";
ALTER TABLE "new_Verdict" RENAME TO "Verdict";

CREATE UNIQUE INDEX "Verdict_milestoneId_version_key" ON "Verdict"("milestoneId", "version");
CREATE INDEX "Verdict_milestoneId_idx" ON "Verdict"("milestoneId");

PRAGMA foreign_keys=ON;
