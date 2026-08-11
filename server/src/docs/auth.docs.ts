//Authentication

import { registry } from './components';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    updateUserSchema,
} from "../schemas/userSchema";


registry.registerPath({
    method: "post",
    path: "/api/v1/auth/register",
    tags: ["Auth"],
    request: {
        body: { content: { "application/json": { schema: registerSchema } } },
    },
    responses: {
        201: { description: "User registered successfully" },
        409: { description: "Username already taken" },
        400: { description: "Validation error" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/v1/auth/login",
    tags: ["Auth"],
    request: {
        body: { content: { "application/json": { schema: loginSchema } } },
    },
    responses: {
        200: { description: "Login successful, cookie token is set" },
        401: { description: "Invalid username or password" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/v1/auth/me",
    tags: ["Auth"],
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Current user profile" },
        401: { description: "Not authenticated" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/v1/auth/logout",
    tags: ["Auth"],
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Logout Successfully" },
        401: { description: "Not Authenticated" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/auth/me",
    tags: ["Auth"],
    summary: "Update current user's profile",
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: updateUserSchema } } },
    },
    responses: {
        200: { description: "Profile updated successfully" },
        400: { description: "Validation error" },
        409: { description: "Username already taken" },
        401: { description: "Not authenticated" },
    },
});
registry.registerPath({
    method: "patch",
    path: "/api/v1/auth/me/password",
    tags: ["Auth"],
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: changePasswordSchema } } },
    },
    responses: {
        200: { description: "Password changed successfully" },
        400: { description: "Validation error, e.g. passwords don't match" },
        401: { description: "Not authenticated, or current password incorrect" },
    },
});