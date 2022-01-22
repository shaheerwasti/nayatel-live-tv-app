function jwPlayer() {
    return {
        restrict: 'EA',
        scope: {
            playerId: '@',
            options: '='
        },
        replace: true,
        link: function(scope, elem) { // t, n ,r
            const playerId = elem.playerId || 'random_player_' + Math.floor(Math.random() * 999999999);
            const setup = function(player) { //eslint-disable-line
                return `<div id="${player}"></div>`;
            };
            elem.html(setup(playerId));
            jwplayer(playerId).setup(scope.options);
        }
    };
}

export default angular.module('app.directive', [])
.directive('jwplayer', jwPlayer).name;
