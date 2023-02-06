import joi from 'joi'

export const rentalSchema = joi.object({
    customerId: joi.number().integer().required(),
    gameId: joi.number().integer().required(),
    rentDate: joi.string().length(10).required(),
    daysRented: joi.number().integer().positive().required(),
    returnDate: joi.string().allow(null).length(10).required(),
    originalPrice: joi.number().integer().required(),
    delayFee: joi.number().allow(null).required()
})

export const postRentalsSchema = joi.object({
  customerId: joi.number().integer().positive().required(),
  gameId: joi.number().integer().positive().required(),
  daysRented: joi.number().integer().positive().required(),
})