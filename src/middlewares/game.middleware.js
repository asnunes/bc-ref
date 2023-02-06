import connection from "../database/database.js"
import { gameSchema } from "../schemas/game.schema.js"

export async function gameValidation(req, res, next) {

    const game = req.body

    const validation = gameSchema.validate(game, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)

        res.status(400).send({ message: errors })
        return
    }

    try {

        const categoryExists = await connection.query(`SELECT * FROM categories WHERE id=$1;`, [game.categoryId])

        if (categoryExists.rows.length === 0) {
            res.sendStatus(400)
            return
        }

        const nameExists = await connection.query(`SELECT * FROM games WHERE name=$1;`, [game.name])

        if (nameExists.rows.length > 0) {
            res.sendStatus(409)
            return
        }

        next()

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}