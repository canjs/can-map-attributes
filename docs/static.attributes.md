@property {Object} can-map-attributes.static.attributes attributes
@parent can-map-attributes.static 0

`Map.attributes` is a property that contains key/value pair(s) of an attribute's name and its
respective type for using in [can-map-attributes.static.convert convert] and [can-map-attributes.static.serialize serialize].

```js
var Contact = Map.extend({
    attributes : {
        birthday : 'date',
        age: 'number',
        name: 'string'
    }
});
```
