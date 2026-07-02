import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/user.model.js';


const authMiddleware = async(req,res,next) => {
    try{
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({
                message: "Unauthorized request"
            })
        }

        const decodedToken = jwt.verify(token, config.JWT_SECRET)

        const user = await User.findById(decodedToken?.user).select('-password')
        if(!user){
            return res.status(401).json({
                message: "Unauthorized request"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message || "Unauthorized request"
        })
    }
}

export default authMiddleware;