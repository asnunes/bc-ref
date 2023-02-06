import { Router } from "express";
import { addGame, getAllGames } from "../controllers/game.controller.js";
import { gameValidation } from "../middlewares/game.middleware.js";

const router = Router()

router.get('/games', getAllGames)

router.post('/games', gameValidation, addGame)

export default router