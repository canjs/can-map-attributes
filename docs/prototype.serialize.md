@function can-map-attributes.prototype.serialize serialize
@parent can-map-attributes.prototype 0

@description Serializes the [can-map Map's] properties using
the [can-map-attributes attribute plugin].

@signature `map.serialize([attrName])`
@param {String} [attrName] If passed, returns only a serialization of the named attribute.
@return {String} A serialization of this Map.

@body
You can set the serialization methods similar to the convert methods:

    var Contact = Map.extend({
		attributes : {
			birthday : 'date'
		},
		serialize : {
			date : function( val, type ){
				return val.getYear() +
					"-" + (val.getMonth() + 1) +
					"-" + val.getDate();
			}
		}
	},{})

    var contact = new Contact();
    contact.attr('birthday', new Date());
    contact.serialize()
    //-> { birthday: 'YYYY-MM-DD' }

You can also get and serialize an individual property by passing the attribute
name to the `serialize` function.  Building on the above demo, we can serialize
the `birthday` attribute only.

    contact.serialize('birthday') //-> 'YYYY-MM-DD'
