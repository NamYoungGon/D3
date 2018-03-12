(function () {

    function Chart(options) {
        let _chart = {};

        let margin = { top: 30, right: 150, bottom: 30, left: 100 },
            _width = 1200 - margin.left - margin.right,
            _height = 300 - margin.top - margin.bottom,
            _data = [],
            _svg,
            _axesG,
            _axisY,
            _axisX,
            _bodyG,
            _barG,
            _lineG,

            _x,
            _y,

            _options = {
                coin: options.coin,
                minutes: options.minutes
            },

            _heightGap;

/*
    {
        "code": "CRIX.UPBIT.KRW-BTC",
        "candleDateTime": "2018-03-06T02:20:00+00:00",
        "candleDateTimeKst": "2018-03-06T11:20:00+09:00",
        "openingPrice": 12545000,   시가
        "highPrice": 12547000,      고가
        "lowPrice": 12543000,       저가
        "tradePrice": 12546000,     종가
        "candleAccTradeVolume": 7.72673031,
        "candleAccTradePrice": 96933656.14119,
        "timestamp": 1520302867616,
        "unit": 5
    },
 */

        _chart.render = function () {
            if (!_svg) {
                _svg = d3.select('body')
                            .append('svg')
                            .attr('width', _width + margin.left + margin.right)
                            .attr('height', _height + margin.top + margin.bottom)
                                .append('g')
                                .attr('transform', `translate(${margin.left}, ${margin.top})`)
            }
                            
            renderAxes();
            renderBody();
        }

        /** 
         * @description 분 표시 축
         */
        function renderAxes() {
            if (!_axesG) {
                _axesG = _svg
                            .append('g')
                            .classed('axes', true)
            }

            renderYAxis(_axesG)
            renderXAxis(_axesG)
        }

        /** 
         * @description 가격 표시 축
         */ 
        function renderYAxis(axesG) {
            if (_y) {
                if (!_axisY) {
                    _axisY = axesG
                                .append('g')
                                .classed('y axis', true)
                                .attr('transform', `translate(${_width}, 0)`)
                }

                let yAxis = d3.axisRight(_y.range([_height, 0]))
                                .ticks(3);

                _axisY.call(yAxis)
            }
        }

        /** 
         * @description 시간 표시 축
         */
        function renderXAxis(axesG) {
            if (_x) {
                if (!_axisX) {
                    _axisX = axesG
                                .append('g')
                                .classed('x axis', true)
                                .attr('transform', `translate(0, ${_height})`)
                }

                let parseTime = d3.timeParse('%')
                let xAxis = d3.axisBottom(_x.range([_width, 0]))
                                // .tickFormat(function (d) { return d3.timeFormat('%hh%mm') })

                _axisX.call(xAxis)
            }
        }

        /** 
         * @description 데이터 영역
         */
        function renderBody() {
            if (!_bodyG) {
                _bodyG = _svg
                            .append('g')
                            .classed('body', true) 

                _lineG = _bodyG
                                .append('g')
                                .classed('line', true)

                _barG = _bodyG
                                .append('g')
                                .classed('bar', true)
            }

            renderHighLowLine(_lineG);
            renderOpeningLine(_lineG);
            renderBars(_barG);
        }

        /** 
         * @description 고가,저가 라인 그리기
         */
        function renderHighLowLine(g) {
            if (_x && _y) {
                g.selectAll("line.highlow-line")
                            .data(_data)
                            .enter()
                                .append("line")
                                .attr("class", "highlow-line");
                                
                g.selectAll("line.highlow-line")
                            .data(_data)
                            .attr('class', function (d) {
                                let isPlus = d.openingPrice >= d.highPrice;
                                let className = isPlus ? 'plus' : 'minus';

                                return `highlow-line ${className}`;
                            })
                            .attr("x1", function (d) { 
                                return _x(new Date(d.candleDateTime));
                            })
                            .attr("x2", function (d) { 
                                return _x(new Date(d.candleDateTime));
                            })
                            .attr("y1", function (d) { 
                                return _y(d.highPrice);
                            })
                            .attr("y2", function (d) { 
                                return _y(d.lowPrice);
                            })
            }
        }

        /** 
         * @description 막대봉 그리기
         */
        function renderBars(g) {
            let padding = 5;
            let barWidth = 10;

            if (_x && _y) {
                /*
                                            "code": "CRIX.UPBIT.KRW-BTC",
                                            "candleDateTime": "2018-03-06T02:20:00+00:00",
                                            "candleDateTimeKst": "2018-03-06T11:20:00+09:00",
                                            "openingPrice": 12545000,   시가
                                            "highPrice": 12547000,      고가
                                            "lowPrice": 12543000,       저가
                                            "tradePrice": 12546000,     종가
                                            "candleAccTradeVolume": 7.72673031,
                                            "candleAccTradePrice": 96933656.14119,
                                            "timestamp": 1520302867616,
                                            "unit": 5
                */
                g
                        .selectAll("rect")
                        .data(_data)
                        .enter()
                            .append("rect")
                                
                g
                        .selectAll("rect")
                        .data(_data)
                        .transition()
                        .attr('class', function (d) {
                            let isPlus = d.tradePrice >= d.openingPrice;
                            let className = isPlus ? 'plus' : 'minus';

                            return className;
                        })         
                        .attr("x", function (d) { 
                            return _x(new Date(d.candleDateTime)) - barWidth / 2;
                        })
                        .attr("y", function (d) { 
                            let y = d.tradePrice > d.openingPrice ? d.tradePrice : d.openingPrice;
                            return _y(y);
                        })
                        .attr("height", function (d) { 
                            let diff = Math.abs(d.tradePrice - d.openingPrice);
                            let height = diff !== 0 ? (_height / _heightGap) * diff : 0;

                            return height; 
                        })
                        .attr("width", function(d){
                            return barWidth;
                        });
            }
        }

        /** 
         * @description 시가 라인 그리기
         */
        function renderOpeningLine(g) {
            if (_x && _y) {
                let padding = 5;
                
                g.selectAll("line.opening-line")
                            .data(_data)
                            .enter()
                                .append("line")
                                .attr("class", "opening-line");
                                
                g.selectAll("line.opening-line")
                            .data(_data)
                            .attr('class', function (d) {
                                let isPlus = d.tradePrice >= d.openingPrice;
                                let className = d.tradePrice > d.openingPrice ? 'plus' : d.tradePrice === d.openingPrice ? 'same' : 'minus'

                                return `opening-line ${className}`;
                            })
                            .attr("x1", function (d) { 
                                return _x(new Date(d.candleDateTime)) - ((Math.floor(_width / _data.length)) / 2) + padding / 2;
                            })
                            .attr("x2", function (d) { 
                                return _x(new Date(d.candleDateTime)) + ((Math.floor(_width / _data.length)) / 2) - padding / 2;
                            })
                            .attr("y1", function (d) { 
                                return _y(d.openingPrice);
                            })
                            .attr("y2", function (d) { 
                                return _y(d.openingPrice);
                            })
            }
        }

        _chart.x = function (x) {
            _x = x;
            return _chart;
        }
        
        _chart.y = function (y) {
            _y = y;
            return _chart;
        }

        _chart.heightGap = function (heightGap) {
            _heightGap = heightGap;
            return _chart;
        }

        _chart.setMinutes = function (minutes) {
            _options.minutes = minutes;
            return _chart;
        }

        _chart.setCoin = function (coin) {
            _options.coin = coin;
            return _chart;
        }

        let update = function () {
            let interval = null;
            
            return function () {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                
                interval = setInterval(function () {
                    getData()
                }, 1000);
            }
        }()

        function getData() {
            $.ajax({
                /**
                 * BTC의 원화마켓 10분 차트의 최종 2개 시세 데이터 세트 가져오기 (최종일시: 2017-12-27 05:10:00 UTC)
                 */
                url: `https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/${_options.minutes}?code=CRIX.UPBIT.KRW-${_options.coin}&count=50`,
                type: 'get',
                success: function (data) {
                    _update(data)
                }
            });
        }

        function _update(data) {
            _data = data

            let maxPrice = d3.max(_data, function (d) { return d.highPrice })
            let minPrice = d3.min(_data, function (d) { return d.lowPrice })

            let calcMinDate = new Date(_data[49].candleDateTime);
            let calcMaxDate = new Date(_data[0].candleDateTime);

            switch (_options.minutes) {
                case "1": 
                    calcMaxDate.setMinutes(calcMaxDate.getMinutes() + 5)
                    break;
                case "5": 
                    calcMaxDate.setMinutes(calcMaxDate.getMinutes() + 15)
                    break;
                case "15": 
                    calcMaxDate.setMinutes(calcMaxDate.getMinutes() + 30)
                    break;
                case "30": 
                    calcMaxDate.setMinutes(calcMaxDate.getMinutes() + 90)
                    break;
            }

            _chart.x(d3.scaleTime().domain([calcMaxDate, calcMinDate]))
            _chart.y(d3.scaleLinear().domain([minPrice, maxPrice]))
            _chart.heightGap(maxPrice - minPrice)
            _chart.render();
        }

        update();

        return _chart;
    }

    window.Chart = Chart;

})()