if (typeof module !== 'undefined') {
    module.exports = metatable;
}

function metatable(d3) {
    var event = d3.dispatch('change', 'rowfocus', 'renameprompt', 'deleteprompt', 'preventprompt');
    var _renamePrompt, _deletePrompt;

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

            event.preventprompt = function(which) {
                switch(which) {
                    case 'rename':
                        _renamePrompt = true;
                    break;
                    case 'delete':
                        _deletePrompt = true;
                    break;
                }
            };

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div')
                    .attr('class', 'controls space-bottom');

                var colbutton = controls.append('a')
                    .text('New column')
                    .attr('href', '#')
                    .attr('class', 'button icon plus')
                    .on('click', function() {
                        d3.event.preventDefault();
                        var name = prompt('column name');
                        if (name) {
                            keyset.add(name);
                            paint();
                        }
                    });

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

                var thEnter = th.enter()
                    .append('th')
                    .text(String);

                var actionLinks = thEnter
                    .append('div')
                    .attr('class', 'small');

                var delbutton = actionLinks
                    .append('a')
                    .attr('href', '#')
                    .attr('class', 'icon trash')
                    .text('Delete');

                var renamebutton = actionLinks
                    .append('a')
                    .attr('href', '#')
                    .attr('class', 'icon pencil')
                    .text('Rename');

                th.exit().remove();

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.enter().append('tr');
                tr.exit().remove();

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                var tdEnter = td.enter()
                    .append('td')

                tdEnter
                    .append('input')
                    .attr('type', 'text')
                    .attr('field', String);

                tdEnter
                    .append('span')
                    .attr('class', 'expand')
                    .append('i')
                    .attr('class', 'fa fa-expand');

                td.exit().remove();

                delbutton.on('click', deleteClick);
                renamebutton.on('click', renameClick);

                function deleteClick(d) {
                    d3.event.preventDefault();
                    var name = d;
                    event.deleteprompt(d, completeDelete);
                    if (_deletePrompt || confirm('Delete column ' + name + '?')) {
                        completeDelete(d);
                    }
                }

                function completeDelete(name) {
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

                function renameClick(d) {
                    d3.event.preventDefault();
                    var name = d;
                    event.renameprompt(d, completeRename);

                    var newname = (_renamePrompt) ?
                        undefined :
                        prompt('New name for column ' + name + '?');

                    if (_renamePrompt || newname) {
                        completeRename(newname, name);
                    }
                }

                function completeRename(value, name) {
                    keyset.add(value);
                    keyset.remove(name);
                    tr.selectAll('input')
                        .data(function(d, i) {
                            var map = d3.map(d);
                            map.set(value, map.get(name));
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
