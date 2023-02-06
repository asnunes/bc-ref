import { Router } from "express";
import { createCategory, getAllCategories } from "../controllers/category.controller.js";
import { categoryValidation } from "../middlewares/category.middleware.js";

const router = Router()

router.get('/categories', getAllCategories)

router.post('/categories', categoryValidation, createCategory)

export default router