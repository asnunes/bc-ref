import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import categoryRoutes from './routes/category.routes.js'
import customerRoutes from './routes/customer.routes.js'
import gameRoutes from './routes/game.routes.js'
import rentalRoutes from './routes/rental.routes.js'

const app = express()

app.use(express.json())
app.use(cors())
app.use(categoryRoutes)
app.use(customerRoutes)
app.use(gameRoutes)
app.use(rentalRoutes)

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Server running on port ${port}`))