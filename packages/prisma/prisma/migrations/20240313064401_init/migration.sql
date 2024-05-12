-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('NOT_STARTED', 'QUEUED', 'IN_PROGRESS', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "git_url" TEXT NOT NULL,
    "sub_domain" TEXT NOT NULL,
    "custom_domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Viewers" (
    "id" TEXT NOT NULL,
    "viewers" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "Viewers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_git_url_key" ON "Project"("git_url");

-- CreateIndex
CREATE UNIQUE INDEX "Project_sub_domain_key" ON "Project"("sub_domain");

-- CreateIndex
CREATE UNIQUE INDEX "Project_custom_domain_key" ON "Project"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "Viewers_project_id_key" ON "Viewers"("project_id");

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewers" ADD CONSTRAINT "Viewers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
