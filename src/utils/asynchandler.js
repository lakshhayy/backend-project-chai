import { exp } from "three/tsl";

const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

export  {asynchandler};

// const asyncHandler = (fn) => (req, res, next) => {
//     try {
//         Promise.resolve(fn(req, res, next)).catch((error) => next(error));
//     } catch (error) {
//         res.status(error.code || 500);
//         message = error.message || "Internal Server Error";
//         success = false;
//     }
// };