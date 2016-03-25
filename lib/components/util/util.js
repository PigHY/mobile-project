define([], function(){
var util = {};

/**
 * UA
 */
var iUA = navigator.userAgent;
util = {

    UA: {
        // Mozilla/5.0 (Linux; U; Android 4.2.1; zh-CN; AMOI N828 Build/JOP40D) AppleWebKit/534.31 (KHTML, like Gecko) UCBrowser/9.2.4.329 U3/0.8.0 Mobile Safari/534.31 
        UCBrowser: /(UCBrowser|UCWEB)\/([0-9.]+)/.test(iUA) ? RegExp.$2 : false,

        Chrome: /Chrome\/([0-9.]+)/.test(iUA) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; U; Android 4.2.1; zh-cn; AMOI N828 Build/JOP40D) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0 MQQBrowser/4.4 Mobile Safari/533.1
        QQBrowser: /MQQBrowser\/([0-9.]+)/.test(iUA) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; MI 2SC Build/JRO03L) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 V1_AND_SQ_4.5.0_5_YYB_D
        QQ: / QQ\/([0-9.]+)/.test(iUA) ? RegExp.$1 : false,

        Safari: /Safari\/([0-9.]+)/.test(iUA) ? RegExp.$1 : false,

        Weibo: /_webbo_([0-9.]+)/.test(iUA) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Safari/537.36
        Android: /Android (\d+\.\d+)/.test(iUA) ? RegExp.$1 : false,

        IOS: /(iPhone|iPod|iPad).*OS (\d+)/.test(iUA) ? RegExp.$2 : false,

        // Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12A365 MicroMessenger/5.4.1 NetType/WIFI
        Weixin: /MicroMessenger\/([0-9.]+)/.test(iUA) ? RegExp.$1 : false
    },
    /**
     * promise 模块
     */
    Promise: function(fn){
        var she = this;
        
        she.queue = [];
        she.current = 0;
        she.then = function(fn){
            typeof fn == 'function' && she.queue.push(fn);
            return she;
        };
        she.start = function(){
            var myArgv = Array.prototype.slice.call(arguments);
            she.resolve.apply(she, myArgv);
        };

        she.resolve = function(){
            var myArgv = Array.prototype.slice.call(arguments);
            
            myArgv.push(she.resolve);
            if(she.current){
                myArgv.push(she.queue[she.current - 1]);
            }

            if(she.current != she.queue.length){
                she.queue[she.current++].apply(she, myArgv);
            }
        };
        if(fn){
            she.then(fn);
        }

        
    },
    /**
     * 判断对象类别
     * @param {Anything} 对象
     * @return {string}  类型
     */
    type: function (obj) {
        var type,
            toString = Object.prototype.toString;
        if (obj == null) {
            type = String(obj);
        } else {
            type = toString.call(obj).toLowerCase();
            type = type.substring(8, type.length - 1);
        }
        return type;
    },

    isPlainObject: function (obj) {
        var she = this,
            key,
            hasOwn = Object.prototype.hasOwnProperty;

        if (!obj || she.type(obj) !== 'object') {
            return false;
        }

        if (obj.constructor &&
            !hasOwn.call(obj, 'constructor') &&
            !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key);
    },

    /**
     * 扩展方法(来自 jQuery)
     * extend([deep,] target, obj1 [, objN])
     * @base she.isPlainObject
     */
    extend: function () {
        var she = this,
            options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && she.type(target) !== 'function') {
            target = {};
        }

        // extend caller itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }

        for (; i<length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (she.isPlainObject(copy) || (copyIsArray = she.type(copy) === 'array'))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && she.type(src) === 'array' ? src : [];
                        } else {
                            clone = src && she.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = she.extend(deep, clone, copy);

                    // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

};

return util;
});
