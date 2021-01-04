const jwt = require('jsonwebtoken');
const config = require('config');

const secretKeyCode = config.get('secretKeyCode');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({msg: 'No token found !! Abort'});
    }

    try {
        jwt.verify(token, secretKeyCode, (err,doc) => {
            if (err) {
                return res.status(401).json({ msg: 'Token is not valid' });
            } else {
                req.user = doc.user;
                console.log(req.user);
                next();
            }
        })
    } catch (err) {
        console.error('something wrong with auth middleware');
        return res.status(500).json({ msg: 'Server Error' });
    }
}