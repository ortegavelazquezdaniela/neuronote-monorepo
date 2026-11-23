/** Valida y reemplaza req.body / req.query con los datos ya limpios del esquema zod. */
export const validateBody = (schema) => (req, _res, next) => {
  req.body = schema.parse(req.body ?? {});
  next();
};

export const validateQuery = (schema) => (req, _res, next) => {
  // En Express 5 req.query es de solo lectura: guardamos el resultado aparte
  req.validQuery = schema.parse(req.query ?? {});
  next();
};
