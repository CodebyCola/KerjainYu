import { ConflictError } from "../../errors/AppError";
import { CreateProjectLinkInput, UpdateProjectLinkInput } from "../../schemas/projectLinkSchema";
import { ProjectLink } from "../../types/entities/projectLink.types";
import { db } from "../db";
import { Knex } from "knex";

export async function createLink(
  projectId: number,
  addedBy: number,
  link: CreateProjectLinkInput
) {
  try {
    const [createdLink] = await db("project_links")
      .insert({
        project_id: projectId,
        added_by: addedBy,
        label: link.label,
        url: link.url,
        category: link.category,
      })
      .returning("*");

    return createdLink;
  } catch (error: any) {
    if (
      error.code === "23505" &&
      error.constraint === "project_links_project_id_url_unique"
    ) {
      throw new ConflictError(
        "This URL already exists in this project"
      );
    }

    throw error;
  }
}
export async function createLinks(
  projectId: number,
  addedBy: number,
  links: CreateProjectLinkInput[],
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  try {

    return await executor("project_links").insert(
      links.map((link) => ({
        project_id: projectId,
        added_by: addedBy,
        label: link.label,
        url: link.url,
        category: link.category,
      })),
    )
  } catch (error: any) {
    if (error.code === "23505" && error.constraint === "project_links_project_id_url_unique") {
      throw new ConflictError(
        "This URL already exists in this project"
      );
    }
    throw error;
    ;
  }
}

export async function updateLink(id: number, link: UpdateProjectLinkInput) {
  try {

    return await db("project_links").where({ id }).update({
      label: link.label,
      url: link.url,
      category: link.category
    }).returning('*')
  } catch (error: any) {
    if (error.code === "23505" && error.constraint === "project_links_project_id_url_unique") {
      throw new ConflictError(
        "This URL already exists in this project"
      );
    }
    throw error;
    ;
  }
}
export async function getLinkById(id: number) {
  return db<ProjectLink>("project_links").where({ id }).first();
}
export async function getAllLinksByProject(projectId: number): Promise<ProjectLink[]> {
  return db<ProjectLink>("project_links").where("project_id", projectId);
}
export async function deleteLink(id: number) {
  const deletedRows = await db("project_links")
    .where({ id })
    .delete();

  return deletedRows;
}