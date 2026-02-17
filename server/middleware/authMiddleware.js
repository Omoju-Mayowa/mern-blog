import jwt from 'jsonwebtoken'
import { HttpError } from '../models/errorModel.js'

 

const verifyToken = (req, res, next) => {
    const token = req.cookies?.acesss_token;
    if(!token) {
        return next(new HttpError('Unauthorized.', 401))
    }
   
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return next(new HttpError('Unauthorized.', 401))
    }
}

export default verifyToken;