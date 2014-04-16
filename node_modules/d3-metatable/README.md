## d3-metatable

A table view component for [d3js](http://d3js.org/) designed for JSON
objects of varying schemas.

### example

```js
container.append('div')
    .data([props])
    .call(
        metatable()
            .on('change', function(d, i) {
                // a row's data is changed
            })
            .on('rowfocus', function(d, i) {
                // a row is focused
            })
```

### api

```js
metatable()
```

A behavior that expects to be called with a selection an array of objects
of data. Emits events:

* `change`: a row is changed. returns the object and the index
* `rowfocus`: a row is focused. returns the object and the index
* `renameprompt`: Column is about to be renamed. Useful for passing in a custom workflow for submitting a value that overrides the default. usage:

``` js
.on('renameprompt', function(d, process) {
    // Prevent the default prompt.
    this.preventprompt('rename');

    // Do it your own way
    var newname = prompt('Rename column to:');

    // Continue internally by passing the new name and current one.
    if (newname) process(newname, d);
});
```

* `deleteprompt`: Column is about to be deleted. Useful for passing in a custom workflow for delete confirmation to override the default one. usage:

``` js
.on('deleteprompt', function(d, process) {
    // Prevent the default prompt.
    this.preventprompt('delete');

    // Do it your own way
    if (confirm('Are you sure you want to delete ' + d + '?')) process(d);
});
```
