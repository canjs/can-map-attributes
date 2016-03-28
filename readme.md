# can-map-attributes (DEPRECATED)

*The attributes plugin has been deprecated in favor of the new [can.Map.prototype.define](https://canjs.com/docs/can.Map.prototype.define.html) plugin, which provides the same functionality. It will still be maintained up to 3.0 and potentially after. Projects using converters or serializers should consider switching to [can.Map.prototype.define.type define's type](https://canjs.com/docs/can.Map.prototype.define.type.html) and [can.Map.prototype.define.serialize define's serialize](https://canjs.com/docs/can.Map.prototype.serialize.html).*

[![Build Status](https://travis-ci.org/canjs/can-map-attributes.png?branch=master)](https://travis-ci.org/canjs/can-map-attributes)

Define Observe attributes


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [ES6 use](#es6-use)
  - [CommonJS use](#commonjs-use)
  - [AMD use](#amd-use)
  - [Standalone use](#standalone-use)
- [Usage](#usage)
  - [Demo](#demo)
  - [Reference types](#reference-types)
- [Converter functions](#converter-functions)
- [Associations](#associations)
  - [Demo](#demo-1)
- [API Reference](#api-reference)
  - [can.Map.attributes.static.serialize](#canmapattributesstaticserialize)
  - [can.Map.attributes.static.convert](#canmapattributesstaticconvert)
    - [Differences From `attr`](#differences-from-attr)
    - [Assocations and Convert](#assocations-and-convert)
  - [can.Map.attributes.static.attributes](#canmapattributesstaticattributes)
  - [can.Map.attributes.prototype.serialize](#canmapattributesprototypeserialize)
- [Making changes](#making-changes)
  - [Making a Build](#making-a-build)
  - [Running the tests](#running-the-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-map-attributes';
```

### CommonJS use

Use `require` to load `can-map-attributes` and everything else
needed to create a template that uses `can-map-attributes`:

```js
var plugin = require("can-map-attributes");
```

### AMD use

Configure the `can` and `jquery` paths and the `can-map-attributes` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-map-attributes',
		    	location: 'node_modules/can-map-attributes/dist/amd',
		    	main: 'lib/can-map-attributes'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-map-attributes/dist/global/can-map-attributes.js'></script>
```

## Usage

can.Map.attributes is a plugin that helps convert and normalize data being set on an Map
and allows you to specify the way complex types get serialized. The attributes plugin is most
helpful when used with [can.Model](https://canjs.com/docs/can.Model.html) \(because the serialization aids in sending data to a server),
but you can use it with any Map you plan to make instances
from.

There are three important static properties to give the class you want to use attributes with:

- `[can.Map.attributes.static.attributes](#canmapattributesstaticattributes)` lists the properties that will be normalized
and the types those properties should be.
- `[can.Map.attributes.static.convert](canmapattributesstaticconvert)` lists how to convert and normalize arbitrary values
to the types this class uses.
- `[can.Map.attributes.static.serialize serialize](#canmapattributesstaticserialize)` lists serialization algorithms for the types
this class uses.

Together, the functions in _convert_ and _serialize_ make up the type definitions for the class.
The attributes plugin comes with three useful predefined types: `'date'`, `'number'`, and `'boolean'`.

Here is a quick example of an Map-based class using the attributes plugin to convert and normalize
its data, and then to serialize the instance:

    Bio = can.Map.extend({
        attributes: {
        birthday: 'date',
        weight: 'number'
    }
    // Bio only uses built-in types, so no
    // need to specify serialize or convert.
    }, {});

    var alice = new Bio({
        birthday: Date.parse('1985-04-01'), // 481161600000
        weight: '120'
    });

    alice.attr();      // { birthday: Date(481161600000), weight: 120 }
    alice.serialize(); // { birthday: 481161600000, weight: 120 }


### Demo

When a user enters a new date in the format of _YYYY-MM-DD_, the control 
listens for changes in the input box and updates the Map using 
the `attr` method which then converts the string into a JavaScript date object.  
Additionally, the control also listens for changes on the Map and 
updates the age in the page for the new birthdate of the contact.

See: can-map-attributes/src/demo/attributes.html

### Reference types

Types listed in `attributes` can also be a functions, such as the `model` or
`models` methods of a [can.Model]. When data of this kind of type is set, this
function is used to convert the raw data into an instance of the Model.

This example builds on the previous one to demonstrate these reference types.

    Bio = can.Map.extend({
        attributes: {
        birthday: 'date',
        weight: 'number'
    }
    // Contact only uses built-in types, so you don't have
    // to specify serialize or convert.
    }, {});

    Contact = can.Map.extend({
        attributes: {
            bio: 'Bio.newInstance'
        }
    }, {});

    var alice = new Contact({
        first: 'Alice',
        last: 'Liddell',
        bio: {
            birthday: Date.parse('1985-04-01'), // 481161600000
            weight: 120
        }
    });

The Attributes plugin provides functionality for converting data attributes from raw types and 
serializing complex types for the server.

Below is an example code of an Map providing serialization and conversion for dates and numbers.  

When `Contact` is initialized, the `weight` attribute is set and converted to a `number` using the
converter we provided.  Next the `birthday` attribute is set using the `attr` method and gets converted
as well.  Lastly, `serialize` is invoked converting the new attributes to raw types for the server.


	var Contact = can.Map.extend({
		attributes: {
			birthday: 'date',
			weight: 'number'
		},
		serialize : {
			date : function( val, type ){
				// returns the string formatted as 'YYYY-DD-MM'
				return val.getYear() + 
						"-" + (val.getMonth() + 1) + 
						"-" + val.getDate(); 
			},
			number: function(val){
				return val + '';
			}
		},
		convert: {
			// converts string to date
			date: function( date ) {
				if ( typeof date == 'string' ) {
					//- Extracts dates formated 'YYYY-DD-MM'
					var matches = raw.match( /(\d+)-(\d+)-(\d+)/ ); 
					
					//- Parses to date object and returns
					date = new Date( matches[ 1 ],
							( +matches[ 2 ] ) - 1, 
							matches[ 3 ] ); 
				}
				
				return date;
			},
		
			// converts string to number
			number: function(number){
				if(typeof number === 'string'){
					number = parseInt(number);
				}
				return number;
			}
		}
	}, {});

	var brian = new Contact({
		weight: '300'
	});
	
	var weight = brian.attr('weight'); //-> 300

	//- sets brian's birthday
	brian.attr('birthday', '11-29-1983');

	var date = brian.attr('birthday'); //-> Date()

	var seralizedObj = brian.serialize();
	//-> { 'birthday': '11-29-1983', 'weight': '300' }
	

## Converter functions

Another common case is to create converter functions (`function(value, oldValue) {}`) that return a converted value:

	var ValueMap = can.Map.extend({
		attributes: {
			value: function(orig) {
				return orig * 100;
			}
		}
	},{});

	console.log(new ValueMap({ value: 0.83 }).attr('value'));


## Associations

The attribute plugin also allows setting up data associations between Maps or Models. This means
that nested data structures can be automatically converted into their Map or Model (using `Model.models`) representations by passing them as the attribute.
If the value to convert is an array it will be converted into its `can.Map.List` or `can.Model.List` (using `can.Model.models`) representation:

	var Sword = can.Model.extend({
		findAll: 'GET /swords'
	}, {
		getPower: function() {
			return this.attr('power') * 100;
		}
	});

	var Level = can.Model.extend({
		findAll: 'GET /levels'
	}, {
		getName: function() {
            return 'Level: ' + this.attr('name');
        }
	});

	var Zelda = can.Model.extend({
		findOne: 'GET /zelda/{id}'
		attributes: {
			sword: Sword,
			levelsCompleted: Level
		}
	},{});


Assuming that `Zelda.findOne({ id: 'link' })` will return something like:

	{
        sword: {
            name: 'Wooden Sword',
            power: 0.2
        },
        levelsCompleted : [
            {id: 1, name: 'Aquamentus'},
            {id: 2, name: 'Dodongo'}
        ]
    }

The converted data will contain a list or Levels and a sword Model:

	Zelda.findOne({ id: 'link' }).then(function(link) {
		console.log(link.attr('sword').getPower()); // -> 20
		console.log(link.attr('levelsCompleted')[0].getName());
		// -> 'Level: Aquamentus'
	});

### Demo

Below is a demo that showcases associations between 2 different models to show the tasks
for each contact and how much time they have left to complete the task(s) using converters.

See: can-map-attributes/src/demo/attributes-assocations.html

## API Reference

- Static Properties
	+ [serialize]
	+ [convert]
	+ [attributes]
- Functions
	+ [serialize]

### can.Map.attributes.static.serialize

`can.Map.serialize` is an object of name-function pairs that are used to
serialize attributes.

Similar to [can.Map.attributes.static.convert can.Map.attributes.convert], in that the keys of this object correspond to
the types specified in [can.Map.attributes].

By default every attribute will be passed through the 'default' serialization method
that will return the value if the property holds a primitive value (string, number, ...),
or it will call the "serialize" method if the property holds an object with the "serialize" method set.

For example, to serialize all dates to ISO format:

```
var Contact = can.Map.extend({
attributes : {
 birthday : 'date'
},
serialize : {
 date : function(val, type){
   return new Date(val).toISOString();
 }
}
},{});

var contact = new Contact({
birthday: new Date("Oct 25, 1973")
}).serialize();
//-> { "birthday" : "1973-10-25T05:00:00.000Z" }
```

### can.Map.attributes.static.convert

You often want to convert from what the observe sends you to a form more useful to JavaScript.
For example, contacts might be returned from the server with dates that look like: "1982-10-20".
We can observe to convert it to something closer to `new Date(1982,10,20)`.

Convert comes with the following types:

- __date__ Converts to a JS date. Accepts integers or strings that work with Date.parse
- __number__ An integer or number that can be passed to parseFloat
- __boolean__ Converts "false" to false, and puts everything else through Boolean()

The following sets the birthday attribute to "date" and provides a date conversion function:

	var Contact = can.Map.extend({
		attributes : {
			birthday : 'date'
		},
		convert : {
			date : function(raw){
				if(typeof raw == 'string'){
					//- Extracts dates formated 'YYYY-DD-MM'
					var matches = raw.match(/(\d+)-(\d+)-(\d+)/);

					//- Parses to date object and returns
					return new Date(matches[1],
							        (+matches[2])-1,
								    matches[3]);

				}else if(raw instanceof Date){
					return raw;
				}
			}
		}
	},{});

	var contact = new Contact();

	//- calls convert on attribute set
	contact.attr('birthday', '4-26-2012')

	contact.attr('birthday'); //-> Date

If a property is set with an object as a value, the corresponding converter is called with the unmerged data (the raw object)
as the first argument, and the old value (a can.Map) as the second:

	var MyObserve = can.Map.extend({
		attributes: {
			nested: "nested"
		},
		convert: {
			nested: function(data, oldVal) {
				if(oldVal instanceof MyObserve) {
					return oldVal.attr(data);
				}
				return new MyObserve(data);
			}
		}
	},{});

#### Differences From `attr`

The way that return values from convertors affect the value of an Observe's property is
different from [can.Map::attr attr]'s normal behavior. Specifically, when the
property's current value is an Observe or List, and an Observe or List is returned
from a convertor, the effect will not be to merge the values into the current value as
if the return value was fed straight into `attr`, but to replace the value with the
new Observe or List completely. Because of this, any bindings you have on the previous
observable object will break.

If you would rather have the new Observe or List merged into the current value, call
`attr` directly on the property instead of on the Observe:

```
var Contact = can.Map.extend({
attributes: {
 info: 'info'
},
convert: {
 'info': function(data, oldVal) {
   return data;
}
}
}, {});

var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
alice.info._cid; // '.observe1'

alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
alice.attr(); // {name: 'Allison Wonderland', 'phone': '888-888-8888'}
alice.info._cid; // '.observe2'

alice.info.attr({email: 'alice@wonderland.com', phone: '000-000-0000'});
alice.attr(); // {name: 'Allison Wonderland', email: 'alice@wonderland.com', 'phone': '000-000-0000'}
alice.info._cid; // '.observe2'
```

#### Assocations and Convert

If you have assocations defined within your model(s), you can use convert to automatically
call serialize on those models.

```
var Contact = can.Model.extend({
attributes : {
 tasks: Task
}
}, {});

var Task = can.Model.extend({
attributes : {
 due : 'date'
}
},{});

var contact = new Contact({
tasks: [ new Task({
 due: new Date()
}) ]
});

contact.serialize();
//-> { tasks: [ { due: 1333219754627 } ] }
```

### can.Map.attributes.static.attributes

`can.Map.attributes` is a property that contains key/value pair(s) of an attribute's name and its
respective type for using in [can.Map.attributes.static.convert](#canmapattributesstaticconvert) and [can.Map.prototype.serialize serialize](#canmapattributesprototypeserialize).

```
var Contact = can.Map.extend({
    attributes : {
        birthday : 'date',
        age: 'number',
        name: 'string'
    }
});
```

### can.Map.attributes.prototype.serialize

Serializes the observe's properties using
the attributes pugin.

@signature `observe.serialize([attrName])`
@param {String} [attrName] If passed, returns only a serialization of the named attribute.
@return {String} A serialization of this Observe.

@body
You can set the serialization methods similar to the convert methods:

    var Contact = can.Map.extend({
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

## Making changes

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
