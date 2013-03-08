(function ($, window) {
    var apiKey = '&key=AIzaSyDf2i19WtZ53A9TiZ2W5zZ-otiAbR1hS8s';
    window.searchResults = function (target, data) {
        var results = $('<div><div class="summary">There are <span class="exact"/> exact matches out of <span class="total"/> results</div></div>');
        var discoveryResponse = data._discovery.response;
        results.find(".exact").text(discoveryResponse.exactSize);
        results.find(".total").text(discoveryResponse.totalSize);
        var imageUrlTemplate = 'https://usercontent.googleapis.com/freebase/v1/image{id}?maxheight=150&maxwidth=150&pad=true' + apiKey;
        $.each(discoveryResponse.itemIds, function (itemIndex, itemId) {
            var item = {
                '_id': itemId,
                '_exact': discoveryResponse.exactMatches[itemIndex],
                '_score': discoveryResponse.relevanceValues[itemIndex]
            };
            if (discoveryResponse.properties) {
                $.extend(item, discoveryResponse.properties[itemIndex]);
            }
            var row = $('' +
                '<div class="row film-result">' +
                '  <div class="row">' +
                '    <div class="span2" data="left"></div>' +
                '    <div class="span7" data="right"></div>' +
                '  </div>' +
                '</div>')
                .attr('id', 'result-' + itemId);
            row.addClass(item._exact ? 'exactmatch' : 'closematch');
            var left = row.find('[data="left"]').removeAttr('data');
            var right = row.find('[data="right"]').removeAttr('data');
            left.append($('<img class="img-polaroid"/>').attr('src', imageUrlTemplate.replace('{id}', item._locator)));
            if (!item._exact) {
                left.append($('<span/>').text('Close match'));
            }
            var nameAndReleaseDate = $('<div class="film-name-and-year"/>');
            if (item.name) {
                nameAndReleaseDate.append($('<span  class="film-name"/>').html(item.name));
                right.append($(nameAndReleaseDate));
                var cleanedName = $('<span>' + item.name + '</span>').text();
                left.find('img').attr('title', cleanedName).attr('alt', cleanedName);
            }
            if (item.initial_release_date) {
                var release_year = item.initial_release_date.match(/\d\d\d\d/);
                if ($.isArray(release_year) && release_year.length === 1) {
                    nameAndReleaseDate.append($('<span class="film-release-year"/>').text('(' + release_year[0] + ')'));
                }
            }
            if ($.isArray(item.rating) && item.rating.length > 0) {
                right.append($('<span class="film-rating"/>').html(item.rating.join('|')));
            }
            if (item.runtime_runtime) {
                if ($.isArray(item.rating) && item.rating.length > 0) {
                    right.append(' ');
                }
                var runtime = !/.*\.0$/.test(item.runtime_runtime) ? item.runtime_runtime + ' minutes' :  minutesToText(item.runtime_runtime);
                right.append($('<span class="film-runtime"/>').text(runtime));
            }
            if ($.isArray(item.genre) && item.genre.length > 0) {
                right.append($('<div class="film-genre">').html(item.genre.join(' | ')));
            }
            if (item.tagline) {
                var taglines = splitOnAmbiguousComma(item.tagline);
                $.each(taglines, function (idx, value) {
                    right.append($('<div class="film-tagline"/>').html(value));
                });
            }
            if ($.isArray(item.directed_by) && item.directed_by.length > 0) {
                right.append($('<div class="film-director"/>').html('A film by ' + arrayToSentenceFragment(item.directed_by)));
            }
            if ($.isArray(item.written_by) && item.written_by.length > 0) {
                right.append($('<div class="film-writer"/>').html('Written by ' + arrayToSentenceFragment(item.written_by)));
            }
            if ($.isArray(item.starring_actor) && item.starring_actor.length > 0) {
                var useCharacters = $.isArray(item.starring_character) && item.starring_actor.length === item.starring_character.length;
                var starring = [];
                if (useCharacters) {
                    $.each(item.starring_actor, function (idx, value) {
                        var desc = value;
                        if (item.starring_character[idx] !== '') {
                            desc += ' as ' + item.starring_character[idx];
                        }
                        starring.push(desc);
                    });
                } else {
                    starring = item.starring_actor;
                }
                right.append($('<div class="film-starring"/>').html('Starring ' + arrayToSentenceFragment(starring)));
            }
            results.append(row);
        });
        target.html(results.contents());
    };
    function arrayToSentenceFragment(values) {
        var result = '';
        $.each(values, function (idx, value) {
            if (idx !== 0) {
                if (values.length > 2) {
                    result += ', ';
                } else {
                    result += ' ';
                }
                if (idx === values.length - 1) {
                    result += 'and ';
                }
            }
            result += value;
        });
        return result;
    }
    function splitOnAmbiguousComma(value) {
        var intermediate = value.split(',');
        var result = [];
        var nonWhitespace = /\S/;
        $.each(intermediate, function (idx, value) {
            if (idx === 0 || value[0].match(nonWhitespace)) {
                result.push(value);
            } else {
                result[result.length - 1] = result[result.length - 1] + ',' + value;
            }
        });
        return result;
    }
})($, window);
