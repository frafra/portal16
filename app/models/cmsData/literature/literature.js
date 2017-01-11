'use strict';

/**
 * @fileoverview Offer regional breakdown of literature
 * , which is required for the GBIF Network page.
 */
let helper = require('../../util/util'),
    Q = require('q'),
    dataApi = require('../../gbifdata/apiConfig'),
    cmsApi = require('../apiConfig'),
    DirectoryParticipants = require('../../gbifdata/directory/directoryParticipants'),
    log = require('../../../../config/log'),
    _ = require('lodash');

let Literature = function (record) {
    this.record = record;
};

Literature.prototype.record = {};

Literature.groupBy = (region) => {
    let deferred = Q.defer(),
        literatureRegional = {
            'literature': [],
            'countries': []
        },
        countries = [],
        literature = [],
        authors = 0;

    // First get participants of the region, then concat literature results by country.
    let query = {};
    if (region !== 'undefined') {
        query.gbifRegion = region;
    }
    DirectoryParticipants.groupBy(query)
        .then(result => {
            let tasks = [];
            result.forEach(p => {
                tasks.push(helper.getApiDataPromise(cmsApi.search.url + '?filter[type]=literature&filter[category_author_from_country]=' + p.countryCode)
                    .then(result => {
                        if (result.count > 0) {
                            countries = countries.concat([p.countryCode]);
                            literature = literature.concat(result.results);
                            result.results.forEach(l => {
                                authors += l.authors.length;
                            });
                        }
                    })
                    .catch(e => {
                        log.info(e);
                        deferred.reject(e);
                    })
                );
            });

            return Q.all(tasks)
                .then(() => {
                    // sort by year, month, day
                    literature = literature.sort((a, b) => {
                        if (a.literatureYear > b.literatureYear) {
                            return -1;
                        }
                        else if (a.literatureYear < b.literatureYear) {
                            return 1;
                        }
                        else {
                            return b.literatureMonth - a.literatureMonth;
                        }
                    });
                    literatureRegional.countries = countries;
                    literatureRegional.literature = literature;
                    literatureRegional.authorsCount = authors;
                    deferred.resolve(literatureRegional);
                })
                .catch(e => {
                    deferred.reject(e + ' in literature.groupBy().');
                });

        });

    return deferred.promise;
};

module.exports = Literature;