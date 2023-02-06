import connection from '../database/database.js'

export async function createCustomer(req, res) {
  
  let { name, phone, cpf, birthday } = req.body
    console.log(birthday)

    name = name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')

    try {

        await connection.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`, [name, phone, cpf, birthday])

        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function findAllCustomers(req, res) {

    let { cpf, offset, limit, order, desc } = req.query

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

        if (cpf) {

            const customersFiltered = await connection.query(`
            SELECT
                customers.id,
                customers.name,
                customers.phone,
                customers.cpf,
                customers.birthday::text,
                COALESCE(COUNT(rentals."customerId"), 0) AS "rentalsCount"
            FROM
                customers
            LEFT JOIN
                rentals
            ON
                customers.id = rentals."customerId"
            WHERE
                cpf LIKE $1
            GROUP BY
                customers.id
            ORDER BY
                ${order} ${desc}
            OFFSET
                $2
            LIMIT
                $3;`,
            [`${cpf}%`, offset, limit])

            res.status(200).send(customersFiltered.rows)
            return
        }

        const customers = await connection.query(`
        SELECT
            customers.id,
            customers.name,
            customers.phone,
            customers.cpf,
            customers.birthday::text,
            COALESCE(COUNT(rentals."customerId"), 0) AS "rentalsCount"
        FROM
            customers
        LEFT JOIN
            rentals
        ON
            customers.id = rentals."customerId"
        GROUP BY
            customers.id
        ORDER BY
            ${order} ${desc}
        OFFSET
            $1
        LIMIT
            $2;`,
        [offset, limit])

        res.status(200).send(customers.rows)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}

export async function findCustomerById(req, res) {

    const { customer } = res.locals

    res.send(customer)
}

export async function updateCustomer(req, res) {

    const { id, customer } = res.locals

    try {

        const name = customer.name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')

        await connection.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;`, [name, customer.phone, customer.cpf, customer.birthday, id])
    
        res.sendStatus(200)

    } catch(err) {
        console.log(err)
        res.sendStatus(500)
    }




}
