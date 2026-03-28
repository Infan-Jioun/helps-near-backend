import express, { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { volunteerResponseController } from "./Volunteerresponse.controller";
import { volunteerResponseValidation } from "./Volunteerresponse.validation";
;

const router = express.Router();

router.get("/my", checkAuth(Role.VOLUNTEER), volunteerResponseController.getMyResponses);

router.post("/:emergencyId", checkAuth(Role.VOLUNTEER), validateRequest(volunteerResponseValidation.createVolunteerResponseSchema), volunteerResponseController.acceptEmergency
);

router.get(
    "/:emergencyId",
    checkAuth(Role.ADMIN, Role.VOLUNTEER),
    volunteerResponseController.getResponsesByEmergencyId
);

router.delete(
    "/:emergencyId",
    checkAuth(Role.VOLUNTEER),
    volunteerResponseController.cancelResponse
);

export const volunteerResponseRoutes: Router = router;