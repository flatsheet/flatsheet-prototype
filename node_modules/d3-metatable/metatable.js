if (typeof module !== 'undefined') {
    module.exports = metatable;
}

function metatable(d3) {
    var event = d3.dispatch('change', 'rowfocus');

    function table(selection) {
        selection.each(function(d) {
            var sel = d3.select(this),
                table;

            var keyset = d3.set();
            d.map(Object.keys).forEach(function(k) {
                k.forEach(function(_) {
                    keyset.add(_);
                });
            });

            bootstrap();
            paint();

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div')
                    .attr('class', 'controls');

                var colbutton = controls.append('button')
                    .on('click', function() {
                        var name = prompt('column name');
                        if (name) {
                            keyset.add(name);
                            paint();
                        }
                    });
                colbutton.append('span').attr('class', 'icon-plus');
                colbutton.append('span').text(' new column');

                var enter = sel.selectAll('table').data([d]).enter().append('table');
                var thead = enter.append('thead');
                var tbody = enter.append('tbody');
                var tr = thead.append('tr');

                table = sel.select('table');
            }

            function paint() {

                var keys = keyset.values();

                var th = table
                    .select('thead')
                    .select('tr')
                    .selectAll('th')
                    .data(keys, function(d) { return d; });

                var thEnter = th.enter().append('th');

                thEnter.append('span')
                    .text(String);

                var delbutton = thEnter.append('button'),
                    renamebutton = thEnter.append('button');

                th.exit().remove();

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.enter()
                    .append('tr');

                tr.exit().remove();

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                td.enter()
                    .append('td')
                    .append('input')
                    .attr('field', String);

                td.exit().remove();

                delbutton.on('click', deleteClick);
                delbutton.append('span').attr('class', 'icon-minus');
                delbutton.append('span').text(' delete');

                renamebutton.append('span').text(' rename');
                renamebutton.on('click', renameClick);

                function deleteClick(d) {
                    var name = d;
                    if (confirm('Delete column ' + name + '?')) {
                        keyset.remove(name);
                        tr.selectAll('input')
                            .data(function(d, i) {
                                var map = d3.map(d);
                                map.remove(name);
                                var reduced = mapToObject(map);
                                event.change(reduced, i);
                                return {
                                    data: reduced,
                                    index: i
                                };
                            });
                        paint();
                    }
                }

                function renameClick(d) {
                    var name = d;
                    var newname = prompt('New name for column ' + name + '?');
                    if (newname) {
                        keyset.remove(name);
                        keyset.add(newname);
                        tr.selectAll('input')
                            .data(function(d, i) {
                                var map = d3.map(d);
                                map.set(newname, map.get(name));
                                map.remove(name);
                                var reduced = mapToObject(map);
                                event.change(reduced, i);
                                return {
                                    data: reduced,
                                    index: i
                                };
                            });
                        paint();
                    }
                }

                function coerceNum(x) {
                    var fl = parseFloat(x);
                    if (fl.toString() === x) return fl;
                    else return x;
                }

                function write(d) {
                    d.data[d3.select(this).attr('field')] = coerceNum(this.value);
                    event.change(d.data, d.index);
                }

                function mapToObject(map) {
                    return map.entries()
                        .reduce(function(memo, d) {
                            memo[d.key] = d.value;
                            return memo;
                        }, {});
                }

                tr.selectAll('input')
                    .data(function(d, i) {
                        return d3.range(keys.length).map(function() {
                            return {
                                data: d,
                                index: i
                            };
                        });
                    })
                    .classed('disabled', function(d) {
                        return d.data[d3.select(this).attr('field')] === undefined;
                    })
                    .property('value', function(d) {
                        var value = d.data[d3.select(this).attr('field')];
                        return !isNaN(value) ? value : value || '';
                    })
                    .on('keyup', write)
                    .on('change', write)
                    .on('click', function(d) {
                        if (d.data[d3.select(this).attr('field')] === undefined) {
                            d.data[d3.select(this).attr('field')] = '';
                            paint();
                        }
                    })
                    .on('focus', function(d) {
                        event.rowfocus(d.data, d.index);
                    });
            }
        });
    }

    return d3.rebind(table, event, 'on');
}
