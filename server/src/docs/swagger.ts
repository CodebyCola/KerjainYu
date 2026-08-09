import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

const generator = new OpenApiGeneratorV3(registry.definitions);
const PORT = process.env.PORT
export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: { title: "KerjainYu API", version: "1.0.0" },
  servers: [{ url: `http://localhost:${PORT}` }],
});
