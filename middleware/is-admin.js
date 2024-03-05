module.exports = (req, res, next) => {
    if (!req || !req.session || !req.session.user || req.session.user.email !== 'alimagdi12367@gmail.com') {
        return res.redirect('/login');
    }
    next();
}
