import express, { Router } from "express";
import { emargencyController } from "./emergency.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post("/", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER), emargencyController.createEmargency);
router.get("/", emargencyController.getAllEmargencies);
router.get("/:id", emargencyController.getEmargencyById);
router.patch("/:id", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER), emargencyController.updateEmargency);
router.delete("/:id", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER), emargencyController.deleteEmargency);

export const emergencyRouter: Router = router;