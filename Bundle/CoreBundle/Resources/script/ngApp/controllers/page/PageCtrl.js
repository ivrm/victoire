ngApp.controller("PageController",
    ["$scope", "$timeout", "widgetLocalStorageService", "widgetAPIService", "$sce",
        function($scope, $timeout, $widgetLocalStorageService, $widgetAPI, $sce) {
            $scope.init = function() {
                //Wait for other controllers initialization
                $timeout(function() {
                    if (debug != undefined && debug == false) {
                        //Try fetching localstorage first
                        $('.vic-widget-asynchronous').each(function () {
                            $scope.feedAsynchronousWidget($(this));
                        });
                    }

                    var widgetIds = [];
                    $('.vic-widget-asynchronous').each(function() {
                        widgetIds.push($(this).data('id'));
                    });

                    if (widgetIds.length < 1) {
                        console.log(widgetIds.length + ' widget(s)');
                        for (key in widgetIds) {
                            //cal API to get html, widget after widget
                            $widgetScope = $('#vic-widget-' + widgetIds[key] + '-container').scope();
                            $widgetScope.fetchAsynchronousWidget();
                        }
                    } else {
                        //too much widgets, let's fetch them in one shot
                        console.log('Fetching widgets in a shot');
                        console.log(widgetIds);

                        var promise = $widgetAPI.widgets(widgetIds);
                        promise.then(
                            function(payload) {
                                for (_widgetId in payload.data) {
                                    console.log('storing');
                                    console.log(_widgetId);
                                    console.log(payload.data[_widgetId]);

                                    $widgetLocalStorageService.store(_widgetId, payload.data[_widgetId]);
                                    $scope.feedAsynchronousWidget($('#vic-widget-' + _widgetId + '-container'));
                                }
                            },
                            function(errorPayload) {
                                console.error('/widgets API call has failed.');
                                console.error(errorPayload);
                            });
                    }
                });
            };

            $scope.feedAsynchronousWidget = function(widget) {
                $widgetScope = $(widget).scope();
                $widgetScope.widgetId = $(widget).data('id');
                $widgetScope.html = $sce.trustAsHtml($widgetLocalStorageService.fetchStorage($widgetScope.widgetId));
                if ($widgetScope.html != undefined && $widgetScope.html != "") {
                    $(widget).removeClass('vic-widget-asynchronous').addClass('vic-widget-asynchronous-was');
                }
            };

        }
    ]);
