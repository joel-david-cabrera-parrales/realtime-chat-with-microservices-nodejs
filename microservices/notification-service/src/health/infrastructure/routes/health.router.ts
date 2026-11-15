import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

export function buildHealthRouter(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get("/", (req, res, next) => {
    controller.check(req, res).catch(next);
  });

  return router;
}
