import { CreateProjectLinkInput } from "../../schemas/projectLinkSchema";
import { ProjectLink } from "../../types/entities/projectLink.types";
import { db } from "../db";
import { Knex } from "knex";
export async function createLink(
  projectId: number,
  addedBy: number,
  links: CreateProjectLinkInput[],
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("project_links").insert(
    links.map((link) => ({
      project_id: projectId,
      added_by: addedBy,
      label: link.label,
      url: link.url,
      category: link.category,
    })),
  );
}

export async function getAllLinksByProject(projectId: number): Promise<ProjectLink[]> {
  return db<ProjectLink>("project_links").where("project_id", projectId);
}