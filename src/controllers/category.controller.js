import connection from '../database/database.js'

export async function createCategory(req, res) {

    const { name } = req.body

    try {

        await connection.query(`INSERT INTO categories (name) VALUES ($1);`, [name])

        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}

export async function getAllCategories(req, res) {

    try {

        let { offset, limit, order, desc } = req.query

        if (!offset) {
            offset = 0
        }

        if (!limit) {
            limit = null
        }

        if (!order) {
            order = 'id'
        }

        if (desc) {
            desc = 'DESC'
        } else {
            desc = ''
        }

        const categories = await connection.query(`SELECT * FROM categories ORDER BY ${order} ${desc} OFFSET $1 LIMIT $2`, [offset, limit])
        res.status(200).send(categories.rows)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}