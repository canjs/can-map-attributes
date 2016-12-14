/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-map-attributes@3.0.0-pre#can-map-attributes*/
define('can-map-attributes', function (require, exports, module) {
    var can = require('can-util/namespace');
    var Map = require('can-map');
    require('can-map/map-helpers');
    require('can-list');
    function applyAttributes(clss) {
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
                    var construct = can.string.getObject(type), context = window, realType;
                    if (type.indexOf('.') >= 0) {
                        realType = type.substring(0, type.lastIndexOf('.'));
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
        var oldSetup = clss.setup;
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
    if (typeof can.Model !== 'undefined') {
        applyAttributes(can.Model);
    }
    Map.prototype.__convert = function (prop, value) {
        var Class = this.constructor, oldVal = this.__get(prop), type, converter;
        if (Class.attributes) {
            type = Class.attributes[prop];
            converter = Class.convert[type] || Class.convert['default'];
        }
        return value === null || !type ? value : converter.call(Class, value, oldVal, function () {
        }, type);
    };
    var oldSerialize = Map.prototype.___serialize;
    Map.prototype.___serialize = function (name, val) {
        var constructor = this.constructor, type = constructor.attributes ? constructor.attributes[name] : 0, converter = constructor.serialize ? constructor.serialize[type] : 0;
        return val && typeof val.serialize === 'function' ? oldSerialize.call(this, name, val) : converter ? converter(val, type) : oldSerialize.apply(this, arguments);
    };
    var mapSerialize = Map.prototype.serialize;
    Map.prototype.serialize = function (attrName) {
        var baseResult = mapSerialize.apply(this, arguments);
        if (attrName) {
            return baseResult[attrName];
        } else {
            return baseResult;
        }
    };
    module.exports = exports = Map;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();