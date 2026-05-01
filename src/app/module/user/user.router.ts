import express, { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { userController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { volunteerValidation } from "../volunteer/volunteer.validation";
import { Role } from "../../../generated/prisma/client/enums";
const router = express.Router();
router.post("/create-volunteer", validateRequest(UserValidation.createVolunteerProfileSchema),
    userController.createVolunteer
);
router.get("/logs", checkAuth(Role.ADMIN), userController.getAllLogs)
router.post("/frontend", checkAuth(Role.ADMIN), userController.saveFrontendLog);
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);

router.get("/:id", checkAuth(Role.ADMIN), userController.getUserById);
router.patch("/:id", checkAuth(Role.ADMIN), validateRequest(UserValidation.updateUserRoleSchema),
    userController.updateUserRole
);

router.patch("/:id/status", checkAuth(Role.ADMIN), validateRequest(UserValidation.updateUserStatusSchema), userController.updateUserStatus);
router.delete("/:id", checkAuth(Role.ADMIN), userController.deleteUser);
export const userRouter: Router = router; 