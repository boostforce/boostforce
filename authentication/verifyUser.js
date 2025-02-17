import jwt from 'jsonwebtoken'
import env from 'dotenv'
import errorHanlder from '../utils/error.js'

env.config()


export const verifyToken = (req, res, next) => {
    
    const token = req.cookies.access_token
    
    if(!token) return next(errorHanlder(401, 'Unauthorized!'))
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err)return next(errorHanlder(401, ' Forbidden!'))
            
        req.user = user;
        next();
    })

}
