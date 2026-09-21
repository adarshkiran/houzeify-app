export const putProjectCustomerBodySchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', minLength: 1, maxLength: 254 },
  },
} as const
