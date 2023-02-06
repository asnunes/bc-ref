import connection from '../database/database.js'

export async function getAllGames(req, res) {

    let { name, offset, limit, order, desc } = req.query

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

    try {

        if (name) {
           

            console.log(name)

            const gamesFiltered = await connection.query(`
            SELECT
                games.*,
                categories.name AS "categoryName",
                COALESCE(COUNT(rentals."gameId"), 0) AS "rentalsCount"
            FROM
                games
            JOIN
                categories
            ON
                games."categoryId" = categories.id
            LEFT JOIN
                rentals
            ON
                games.id = rentals."gameId"
            WHERE
                games.name ILIKE $1
            GROUP BY
                games.id, categories.name
            ORDER BY
                "${order}" ${desc}
            OFFSET
                $2
            LIMIT
                $3;`,
            [`${name}%`, offset, limit])

            res.status(200).send(gamesFiltered.rows)
            return
        }

        const games = await connection.query(`
        SELECT
            games.*,
            categories.name AS "categoryName",
            COALESCE(COUNT(rentals."gameId"), 0) AS "rentalsCount"
        FROM
            games
        JOIN
            categories
        ON
            games."categoryId" = categories.id
        LEFT JOIN
            rentals
        ON
            games.id = rentals."gameId"
        GROUP BY
            games.id, categories.name
        ORDER BY
            "${order}" ${desc}
        OFFSET
            $1
        LIMIT
            $2;`,
        [offset, limit])

        res.status(200).send(games.rows)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function addGame(req, res) {

    let { name, image, stockTotal, categoryId, pricePerDay } = req.body

    try {

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay])

        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}