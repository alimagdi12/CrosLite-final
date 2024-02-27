module.exports = (req, res, next) => {
    if (req.session.user.email !== 'alimagdi12367@gmail.com') {
        return res.redirect('/login');
    }
    next();
}
