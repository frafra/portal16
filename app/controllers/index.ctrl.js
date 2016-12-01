var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    if (typeof req.query.q !== 'undefined') {
        res.redirect(res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        render(req, res, next, {
            _meta: {
                title: 'GBIF',
                bodyClass: 'hasTransparentMenu',
                hideSearchAction: true
            }
        });
    }
});

function render(req, res, next, data) {
    try {
        res.render('pages/home/home', data);
    } catch (err) {
        next(err);
    }
}
