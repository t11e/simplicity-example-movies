$(function() {
    $('body').simplicityState();
    $('#q,#genre,#rating,#initialReleaseYearMin,#initialReleaseYearMax,#runtimeMin,#runtimeMax').simplicityInputs();
    var currentYear = new Date().getFullYear();
    $('#initialReleaseYearSlider').simplicitySlider({
        input: ['#initialReleaseYearMin', '#initialReleaseYearMax'],
        min: 1887,
        max: currentYear + 1,
        any:[1887, currentYear + 1],
        range: true
    }).bind('slide slidechange', function (evt, ui) {
        var min = ui.values[0] === 1887 ? '' : ui.values[0];
        var max = ui.values[1] === (currentYear + 1) ? '' : ui.values[1];
        var message = 'Released ';
        if (min === '' && max === '') {
            message += 'in any year';
        } else if (min === '') {
            message += 'through ' + max;
        } else if (max === '') {
            message += 'after ' + min;
        } else {
            message += '' + min + ' - ' + max;
        }
        $('#initialReleaseYearCriteriaDesc').text(message);
    }).slider('values', [ 1887, currentYear + 1 ] );
    $('#runtimeSlider').simplicitySlider({
      input: ['#runtimeMin', '#runtimeMax'],
      min: 0,
      max: 361,
      any: [0, 361],
      range: true
    }).bind('slide slidechange', function (evt, ui) {
        var min = ui.values[0] === 0 ? '' : ui.values[0];
        var max = ui.values[1] === 361 ? '' : ui.values[1];
        var message = 'Runtime ';
        if (min === '' && max === '') {
            message += 'of any length';
        } else if (min === '') {
            message += 'up to ' + minutesToText(max);
        } else if (max === '') {
            message += 'at least ' + minutesToText(min);
        } else {
            message += 'from ' + minutesToText(min) + ' to ' + minutesToText(max);
        }
        $('#runtimeCriteriaDesc').text(message);
    }).slider('values', [ 0, 361 ] );
    $('#genre,#rating').simplicityFacetedSelect().hide();
    $('#genreFancy').simplicityFancySelect({
        select: '#genre'
    });
    $('#ratingFancy').simplicityFancySelect({
        select: '#rating'
    });
    $('#results').simplicitySearchResults({
        resultsCallback: window.searchResults
    });
    $('#paginationTop,#paginationBottom').simplicityPagination();
    $('#resetSearch').click(function () {
        $('body').simplicityState('reset');
    });
    $('body')
        .simplicityState('mergeQueryParams')
        .simplicityHistory()
        .simplicityState('triggerChangeEvent')
        .simplicityPageSnapBack()
        .simplicityDiscoverySearch({
            url: 'http://freebase-movies.discoverysearchengine.com:8090/ws/query',
            backend: 'engine',
            controllerCallback: window.searchController
        })
        .simplicityDiscoverySearch('search');
});

function minutesToText(mins) {
    var hours = Math.floor(mins / 60);
    var minutes = mins % 60;
    return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
}
