import dayjs from 'dayjs'
import connection from '../database/database.js'

export async function postRental(req, res) {

    const { customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee } = res.locals.rental

    try {

        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee])

        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function returnRental(req, res) {

    const { rental } = res.locals

    const today = dayjs().format('YYYY-MM-DD').toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }).slice(0, 11)

    const dueDate = new Date(rental.rentDate).getTime() + (rental.daysRented * 1000 * 60 * 60 * 24)

    const days = Math.ceil((new Date(today).getTime() - dueDate) / (1000 * 60 * 60 * 24))

    let delayFee

    if (days > 0) {
        delayFee = (rental.originalPrice / rental.daysRented) * days
    }

    try {

        await connection.query(`UPDATE rentals SET "delayFee"=$1, "returnDate"=$2 WHERE id=$3;`, [delayFee, today, rental.id])

        res.sendStatus(200)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function findAllRentals(req, res) {

    let { customerId, gameId, offset, limit, order, desc, status, startDate } = req.query

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

    let where

    if (customerId && gameId) {
        where = `WHERE customers.id = ${customerId} AND games.id = ${gameId}`
    } else if (customerId) {
        where = `WHERE customers.id = ${customerId}`
    } else if (gameId) {
        where = `WHERE games.id = ${gameId}`
    } else {
        where = ''
    }

    if (status === 'open' && !(customerId || gameId)) {
        where = `WHERE rentals."returnDate" IS NULL`
    } else if (status === 'closed' && !(customerId || gameId)) {
        where = `WHERE rentals."returnDate" IS NOT NULL`
    } else if (status === 'open') {
        where += ` AND rentals."returnDate" IS NULL`
    } else if (status === 'closed') {
        where += ` AND rentals."returnDate" IS NOT NULL`
    }

    if (startDate && !(customerId || gameId || status)) {
        where = `WHERE rentals."rentDate" >= DATE '${startDate}'`
    } else if (startDate) {
        where += ` AND rentals."rentDate" >= DATE '${startDate}'`
    }

    try {

        const rentals = await connection.query(`
        SELECT
        rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate"::text, rentals."daysRented", rentals."daysRented", rentals."returnDate"::text, rentals."originalPrice", rentals."delayFee", jsonb_build_object('id', customers.id, 'name', customers.name) AS "customer", jsonb_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS "game"
        FROM
            customers
        JOIN
            rentals
        ON
            customers.id = rentals."customerId"
        JOIN
            games
        ON
            games.id = rentals."gameId"
        JOIN
            categories
        ON
            games."categoryId" = categories.id
        ${where}
        ORDER BY
            "${order}"
        ${desc}
        OFFSET
            $1
        LIMIT
            $2
        `, [offset, limit])

        res.status(200).send(rentals.rows)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function deleteRental(req, res) {

    const { id } = res.locals

    try {

        await connection.query(`DELETE FROM rentals WHERE id=$1`, [id])

        res.sendStatus(200)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function getMetrics(req, res) {

    const { startDate, endDate } = req.query

    let where

    if (startDate && endDate) {
        where = `WHERE "rentDate" BETWEEN DATE '${startDate}' AND DATE '${endDate}'`
    } else if (startDate) {
        where = `WHERE "rentDate" >= DATE '${startDate}'`
    } else if (endDate) {
        where = `WHERE "rentDate" <= DATE '${endDate}'`
    }

    try {

        const details = await connection.query(`SELECT SUM("originalPrice" + COALESCE("delayFee", 0)), COUNT(id) FROM rentals ${where}`)

        let {sum: revenue, count: rentals} = details.rows[0]

        const average = revenue/rentals

        const result = {
            revenue: Number(revenue),
            rentals: Number(rentals),
            average
        }

        res.send(result)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}