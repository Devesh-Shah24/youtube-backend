const handler = (reqHandler) => {
  return(req, res, next) => {
    Promise.resolve(reqHandler(req, res, next))
    .catch((error) => next(error));
  }
};

export { handler };



// const handler = (fn) => async (req, res, next) => { 
//   try {
//     await fn(req, res, next);
//   }catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error"
//     });
//   }
// }