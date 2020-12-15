const Joi = require('joi-browser')
const validations = new Map([
  ['email', Joi.string().email({ minDomainAtoms: 2 }).max(256)],
  ['password', Joi.string().min(6).max(50)],
  ['name', Joi.string().min(6).max(50)],
  ['phonenumber', Joi.number().min(100000)],
  ['number', Joi.number()],
  /* ['username', Joi.string().min(5).max(50)],
  ['date', Joi.object().min(1).required()],
  ['motto', Joi.string().allow('').optional().min(3).max(255)],
  ['message', Joi.string().min(6).max(1000)],
  ['key', Joi.string().min(3).max(25)],
  ['social', Joi.string().allow('').optional().min(6).max(100)],
  ['number', Joi.number()],
  ['phone', Joi.number().min(100000).max(1000000000000000)],
  ['hours', Joi.number().min(0).max(24)],
  ['event_name', Joi.string().min(3).max(150)],
  ['event_participants_max', Joi.number().min(1).max(50)],
  ['event_participants_guests_max', Joi.number().min(1000).max(20000)] */
])

export default (validation, value) => {
  if (validations.has(validation)) {
    return Joi.validate(
      { [validation]: value },
      { [validation]: validations.get(validation) }
    )
  } else if(validation.includes('(') && validation.includes(')')){
    return Joi.validate(
      { [validation]: value },
      { [validation]: eval(`Joi.${validation}`) }
    )
  } else {
    console.log('No validation found for', validation)
    return false
  }
}
