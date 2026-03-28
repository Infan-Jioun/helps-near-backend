import express, { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../../middleware/validateRequest";
import { volunteerController } from "./volunteer.controller";
import { volunteerValidation } from "./volunteer.validation";
const router = express.Router();


export const volunteerRouter: Router = router;