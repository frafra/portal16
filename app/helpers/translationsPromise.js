'use strict';

var marked = require('marked'),
    fs = require('fs'),
    Q = require('q');

function parseMarkdown(data) {
    return marked(data);
}

function getTranslatedMarkdown(directory, language) {
    var deferred = Q.defer();
    var readFile = Q.denodeify(fs.readFile);
    if (!language) language = 'en';

    readFile(__dirname + '/../../locales/markdown/' + directory + language + '.md', 'utf8')
        .then(function(data){
            data = parseMarkdown(data);
            deferred.resolve(data);
        })
        .catch(function(err){
            deferred.reject(err.message)
        });
    return deferred.promise;
}

function getTranslations(files, language) {
    var defer = Q.defer();
    var tasks = [];
    files.forEach(function (f) {
        tasks.push(getTranslatedMarkdown(f, language));
    });

    Q.all(tasks)
        .then(function(translations){
            defer.resolve(translations);
        })
        .catch(function(err){
            return defer.reject(err);
        });
    return defer.promise;
}

module.exports = {
    getTranslations: getTranslations
};