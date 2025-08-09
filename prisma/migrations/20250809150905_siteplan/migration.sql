-- CreateTable
CREATE TABLE "public"."SitePlan" (
    "id" SERIAL NOT NULL,
    "idea" TEXT NOT NULL,
    "full" TEXT NOT NULL,
    "spec" TEXT,
    "siteMap" TEXT,
    "components" TEXT,
    "copy" TEXT,
    "codePlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitePlan_pkey" PRIMARY KEY ("id")
);
