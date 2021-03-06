var can = require('can-util/namespace');
var Map = require('can-map');
require('can-map/map-helpers');
require('can-list');

//!steal-remove-start
can.dev.warn("can/map/attributes is a deprecated plugin and will be removed in a future release. "+
	"can/map/define provides the same functionality in a more complete API.");
//!steal-remove-end

function applyAttributes (clss) {

	// in some cases model might not be defined quite yet.
	if (clss === undefined) {
		return;
	}
	var isObject = function (obj) {
		return typeof obj === 'object' && obj !== null && obj;
	};
	can.assign(clss, {

		attributes: {},

		convert: {
			'date': function (str) {
				var type = typeof str;
				if (type === 'string') {
					str = Date.parse(str);
					return isNaN(str) ? null : new Date(str);
				} else if (type === 'number') {
					return new Date(str);
				} else {
					return str;
				}
			},
			'number': function (val) {
				return parseFloat(val);
			},
			'boolean': function (val) {
				if (val === 'false' || val === '0' || !val) {
					return false;
				}
				return true;
			},
			'default': function (val, oldVal, error, type) {
				// Convert can.Model types using .model and .models
				if (Map.prototype.isPrototypeOf(type.prototype) && typeof type.model === 'function' && typeof type.models === 'function') {
					return type[can.isArray(val) ? 'models' : 'model'](val);
				}
				if (Map.prototype.isPrototypeOf(type.prototype)) {
					if (can.isArray(val) && typeof type.List === 'function') {
						return new type.List(val);
					}
					return new type(val);
				}
				if (typeof type === 'function') {
					return type(val, oldVal);
				}
				var construct = can.string.getObject(type),
					context = window,
					realType;
				// if type has a . we need to look it up
				if (type.indexOf('.') >= 0) {
					// get everything before the last .
					realType = type.substring(0, type.lastIndexOf('.'));
					// get the object before the last .
					context = can.string.getObject(realType);
				}
				return typeof construct === 'function' ? construct.call(context, val, oldVal) : val;
			}
		},
		serialize: {
			'default': function (val) {
				return isObject(val) && val.serialize ? val.serialize() : val;
			},
			'date': function (val) {
				return val && val.getTime();
			}
		}
	});
	// overwrite setup to do this stuff
	var oldSetup = clss.setup;
	/**
	 * @hide
	 * @function can.Map.setup
	 * @parent can.Map.attributes
	 *
	 * `can.Map.static.setup` overrides default `can.Map` setup to provide
	 * functionality for attributes.
	 *
	 */
	clss.setup = function (superClass, fullName, stat, proto) {
		var self = this;
		oldSetup.call(self, superClass, fullName, stat, proto);
		can.each(['attributes'], function (name) {
			if (!self[name] || superClass[name] === self[name]) {
				self[name] = {};
			}
		});
		can.each([
			'convert',
			'serialize'
		], function (name) {
			if (superClass[name] !== self[name]) {
				self[name] = can.deepAssign({}, superClass[name], self[name]);
			}
		});
	};
}
applyAttributes(Map);
// Check to see if can-model has been loaded but not set up for attributes.
//  If not loaded, don't try to import it.  If it gets loaded
//  later, it will be properly set up with attributes.
if(typeof can.Model !== "undefined") {
	applyAttributes(can.Model);
}

/**
 * @hide
 * @function can.Map.prototype.convert
 * @parent can.Map.attributes
 */
Map.prototype.__convert = function (prop, value) {
	// check if there is a
	var Class = this.constructor,
		oldVal = this.__get(prop),
		type, converter;
	if (Class.attributes) {
		// the type of the attribute
		type = Class.attributes[prop];
		converter = Class.convert[type] || Class.convert['default'];
	}
	return value === null || !type ? value : converter.call(Class, value, oldVal, function () {}, type);
};

var oldSerialize = Map.prototype.___serialize;
Map.prototype.___serialize = function(name, val){

	var constructor = this.constructor,
		type = constructor.attributes ? constructor.attributes[name] : 0,
		converter = constructor.serialize ? constructor.serialize[type] : 0;

	return val && typeof val.serialize === 'function' ?
		// call attrs or serialize to get the original data back
		oldSerialize.call(this, name, val) :
		// otherwise if we have  a converter
		converter ?
		// use the converter
		converter(val, type) :
		// or return the val
		oldSerialize.apply(this, arguments);
};
// add support for single value serialize
var mapSerialize = Map.prototype.serialize;
Map.prototype.serialize = function (attrName) {
	var baseResult = mapSerialize.apply(this, arguments);
	if(attrName){
		return baseResult[attrName];
	} else {
		return baseResult;
	}
};

module.exports = exports = Map;
