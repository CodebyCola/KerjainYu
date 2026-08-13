import * as taskRepo from "../database/repositories/task.repository"
import * as projectRepo from "../database/repositories/project.repository"
import * as projectMemberRepo from "../database/repositories/project.member.repository"
import * as taskInput from "../schemas/task.schema"
import { ForbiddenError } from "../errors/AppError"

//GET api/v1/tasks?filter=assigned-me
export async function getTasksByUser(userId: number) {
    const tasks = await taskRepo.getTasksByUser(userId)
    return tasks
}

//GET api/v1/tasks
export async function getTasks(userId: number, query: taskInput.GetTasksQueryInput) {
    const { projectId, filter } = query;
    if (projectId) { // Fetch tasks data per project
        const membership = await projectMemberRepo.getRole(projectId, userId)
        if (!membership) {
            throw new ForbiddenError("You're not part of this project")
        }
        if (filter === 'assigned-me') {
            return await taskRepo.getTasksByProject(projectId, userId);
        }

        return await taskRepo.getTasksByProject(projectId)
    }
    return await taskRepo.getTasksByUser(userId) // Fetch tasks that are belongs to user
}

//kerjainyu/my-tasks -> bakalan nampilin semua task
//GET /api/v1/tasks/