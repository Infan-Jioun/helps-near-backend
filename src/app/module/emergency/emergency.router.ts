import express, { Router } from "express";
import { emargencyController } from "./emergency.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { createEmergencySchema, updateEmergencySchema } from "./emergency.validation"
import { Role } from "../../../generated/prisma/client/enums";

const router = express.Router();

router.post("/", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER),
    validateRequest(createEmergencySchema), emargencyController.createEmargency);
router.get("/", emargencyController.getAllEmargencies);
router.get("/:id", emargencyController.getEmargencyById);
router.patch("/:id", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER), validateRequest(updateEmergencySchema), emargencyController.updateEmargency);
router.delete("/:id", checkAuth(Role.USER, Role.ADMIN, Role.VOLUNTEER), emargencyController.deleteEmargency);

export const emergencyRouter: Router = router;