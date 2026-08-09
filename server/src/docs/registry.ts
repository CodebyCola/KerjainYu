import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema } from "../schemas/userSchema";
import { createProjectWithLinksSchema } from "../schemas/projectSchema";

export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    200: { description: "User registered successfully" },
    409: { description: "Username already taken" },
    400: { description: "Validation error" },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: { description: 'Login successful, cookie token is set' },
    401: { description: 'Invalid username or password' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/projects',
  tags: ['Projects'],
  security: [{ cookieAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createProjectWithLinksSchema } } } },
  responses: {
    201: { description: 'Project created successfully' },
    400: { description: 'Validation error' },
    401: { description: 'Not authenticated' },
  },
});