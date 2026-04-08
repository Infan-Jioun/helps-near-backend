import express, { Router } from "express"
import { authController } from "./auth.controller";
import { loginUserZodSchema, registerUserZodSchema } from "./auth.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/client/enums";


const router = express.Router();
router.post("/register", validateRequest(registerUserZodSchema), authController.createUser)
router.post("/login", validateRequest(loginUserZodSchema), authController.loginUser)
router.get("/me", checkAuth(Role.ADMIN, Role.USER, Role.VOLUNTEER), authController.getMyProfile);
router.post("/verify-email", authController.verifyEmail)
router.post("/resend-otp", authController.resendOtp)
router.post("/logout", authController.logout)
router.post("/refresh-token", authController.getNewToken)
router.get("/login/google", authController.googleLogin)
router.get("/google/success", authController.googleLoginSuccess)
router.get("/oauth/error", authController.handelAuthError)
export const authRouter: Router = router