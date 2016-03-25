/*
 * Based on CokeUtil, add more utility methods for YYM usage.
 *
 * See https://github.com/riotkkwok/CokeUtil for details
 *
 * Auther: Rio Kwok
 *
 */

;(function(){
    var CokeUtil = {};

    var ua = window.navigator.userAgent, param;


    /**
     * Specify the format(string) to parse the date object to string.
     *
     * @param {Date} Date object to be parsed
     * @param {string} The format to be returned,
     *        Y - one digit of year
     *        M - one digit of month
     *        D - one digit of day
     *        h - one digit of hour
     *        m - one digit of minute
     *        s - one digit of second
     * @returns {string}
     */
    CokeUtil.formatDate = function(date, format){
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var result = format, tmpObj = {};

        if(!date instanceof Date){
            try{
                console.error('The argument \'date\' is not a Date Object.');
            }catch(e){}
            return '';
        }
        if(typeof format !== 'string'){
            try{
                console.error('The argument \'format\' is not a string.');
            }catch(e){}
            return '';
        }

        function toString(ch, val){
            var start = result.indexOf(ch);
            if(start < 0){
                return '';
            }
            for(var i=1; i<result.length; i++){
                if(result[start + i] !== ch){
                    break;
                }
            }
            if(ch === 'M'){
                if(i > 3){
                    result = result.replace(result.substring(start, start + i), months[val-1]);
                }else if(i === 3){
                    result = result.replace(result.substring(start, start + i), months[val-1].substr(0, i));
                }else{
                    result = result.replace(result.substring(start, start + i), ('0'+val).toString().substr(-1 * i));
                }
            }else if(ch === 'Y'){
                result = result.replace(result.substring(start, start + i), val.toString().substr(-1 * i));
            }else{
                result = result.replace(result.substring(start, start + i), ('0'+val).toString().substr(-1 * i));
            }
        }

        tmpObj.year = date.getFullYear();
        tmpObj.month = date.getMonth() + 1;
        tmpObj.day = date.getDate();
        tmpObj.hour = date.getHours();
        tmpObj.minute = date.getMinutes();
        tmpObj.second = date.getSeconds();

        toString('Y', tmpObj.year)
        toString('D', tmpObj.day)
        toString('h', tmpObj.hour)
        toString('m', tmpObj.minute)
        toString('s', tmpObj.second)
        toString('M', tmpObj.month);

        return result;
    };


    /**
     * Compare the versions.
     *
     * @param {string} version number string, likes 10.1, 2.3.4, 1.0.0.2
     * @param {string} version number string, likes 10.1, 2.3.4, 1.0.0.2
     * @returns {number|null} -1, 0, 1
     */
    CokeUtil.compareVers = function(ver1, ver2){
        if(typeof ver1 !== 'string' || typeof ver2 !== 'string' || ver1.length === 0 || ver2.length === 0){
            return null;
        }
        if(ver1 === ver2){
            return 0;
        }
        var re1 = ver1.split('.'), re2 = ver2.split('.');
        for(var i = 0; i<re1.length && i<re2.length; i++){
            if(parseInt(re1[i], 10) > parseInt(re2[i], 10)){
                return 1;
            }else if(parseInt(re1[i], 10) < parseInt(re2[i], 10)){
                return -1;
            }
        }
        if(parseInt(re1[i] || '0', 10) > parseInt(re2[i] || '0', 10)){
            return 1;
        }else if(parseInt(re1[i] || '0', 10) < parseInt(re2[i] || '0', 10)){
            return -1;
        }else{
            return 0;
        }
    };


    /**
     * Get the value of specified param.
     *
     * @param {string} the param name
     * @param {boolean} to re-parse the URL param or not
     * @returns {string|null}
     */
    CokeUtil.getURLParam = function(name, isRenew){
        var re = /(?:\?|&)([^&=]*)=?([^&]*)/g;
        if(name === null || name === undefined || name === ''){
            return null;
        }
        if(isRenew || !param){
            param = {};
            window.location.search.replace(re, function () {
                if (arguments[1]) {
                    param[arguments[1]] = arguments[2];
                }
                return '';
            });
        }
        return (param[name] === "" ) ? null : param[name];
    };


    CokeUtil.killKeyboard = function(){
        try {
            if(document.activeElement && document.activeElement.nodeName.toLowerCase() != 'body') {
                document.activeElement.blur();
            } else {
                for(var i=0; i<document.querySelectorAll('input, textarea, select').length; i++){
                    document.querySelectorAll('input, textarea, select')[i].blur();
                }
            }
        } catch(e) {}    
    };


    /**
     * user agent info
     *
     */
    CokeUtil.userAgent = {

        /* OS checking [start] */
        isIOS: /iPhone|iPod|iPad/i.test(ua),
        isAndroid: /Android/i.test(ua),
        /* OS checking [end] */

        /* App checking [start] */
        isWeiXin: /MicroMessenger/i.test(ua),
        isWeibo: /weibo/i.test(ua),
        isYY: /.*YY/.test(ua),
        /* App checking [end] */

        /* Browser checking [start] */
        isChrome: /chrome/i.test(ua),
        isUCWEB: /UCWEB|UCBrowser/i.test(ua),
        isOpera: /Opera|Oupeng/i.test(ua),
        isFireFox: /Firefox/i.test(ua),
        isQQBrowser: /MQQBrowser/i.test(ua),
        is360Browser: /360 Aphone Browser/i.test(ua),
        isLieBao: /LieBao/i.test(ua),
        isBaiduBrowser: /baidubrowser/i.test(ua),
        isIE: /(MSIE).*(Windows).*(Trident)?/i.test(ua),
        /* Browser checking [end] */

        /* Device checking [start] */
        isSmartis: /SANFRANCISCO/i.test(ua),
        /* Device checking [end] */
    };



    CokeUtil.UA = {
        // Mozilla/5.0 (Linux; U; Android 4.2.1; zh-CN; AMOI N828 Build/JOP40D) AppleWebKit/534.31 (KHTML, like Gecko) UCBrowser/9.2.4.329 U3/0.8.0 Mobile Safari/534.31 
        UCBrowser: /(UCBrowser|UCWEB)\/([0-9.]+)/.test(ua) ? RegExp.$2 : false,

        Chrome: /Chrome\/([0-9.]+)/.test(ua) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; U; Android 4.2.1; zh-cn; AMOI N828 Build/JOP40D) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0 MQQBrowser/4.4 Mobile Safari/533.1
        QQBrowser: /MQQBrowser\/([0-9.]+)/.test(ua) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; U; Android 4.1.1; zh-cn; MI 2SC Build/JRO03L) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 V1_AND_SQ_4.5.0_5_YYB_D
        QQ: / QQ\/([0-9.]+)/.test(ua) ? RegExp.$1 : false,

        Safari: /Safari\/([0-9.]+)/.test(ua) ? RegExp.$1 : false,

        Weibo: /_webbo_([0-9.]+)/.test(ua) ? RegExp.$1 : false,

        // Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Safari/537.36
        Android: /Android[\/ ](\d+\.\d+)/.test(ua) ? RegExp.$1 : false,

        IOS: /(iPhone|iPod|iPad).*OS (\d+)/.test(ua) ? RegExp.$2 : false,

        // Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12A365 MicroMessenger/5.4.1 NetType/WIFI
        Weixin: /MicroMessenger\/([0-9.]+)/.test(ua) ? RegExp.$1 : false
    },
    /**
     * promise 模块
     */
    CokeUtil.Promise = function(fn){
        var she = this;
        
        she.queue = [];
        she.current = 0;
        she.isResolved = false;
        she.then = function(fn){
            typeof fn == 'function' && she.queue.push(fn);
            she.isResolved && fn.apply(she);
            return she;
        };
        she.when = function(){
            var myArgv = Array.prototype.slice.call(arguments);

            function finish(p){
                var j = 0;
                for(var i=0; i<myArgv.length; i++){
                    if(p === myArgv[i]){
                        myArgv[i] = null;
                    }
                    if(myArgv[i] === null){
                        j++;
                    }
                }
                if(j === myArgv.length){
                    she.resolve();
                }
            }

            for(var i=0; i<myArgv.length; i++){
                if(myArgv[i] instanceof CokeUtil.Promise){
                    myArgv[i].then(function(){
                        var _this = this;
                        setTimeout(function(){
                            finish(_this);
                        }, 0);
                    });
                }
            }

            return she;
        };
        she.start = function(){
            var myArgv = Array.prototype.slice.call(arguments);
            she.resolve.apply(she, myArgv);
        };

        she.resolve = function(){
            var myArgv = Array.prototype.slice.call(arguments);
        
            she.isResolved = true;

            myArgv.push(she.resolve);
            if(she.current){
                myArgv.push(she.queue[she.current - 1]);
            }

            if(she.current != she.queue.length){
                she.queue[she.current++].apply(she, myArgv);
                she.resolve(myArgv);
            }
        };
        if(fn){
            she.then(fn);
        }

        
    };
    /**
     * 判断对象类别
     * @param {Anything} 对象
     * @return {string}  类型
     */
    CokeUtil.type = function (obj) {
        var type,
            toString = Object.prototype.toString;
        if (obj == null) {
            type = String(obj);
        } else {
            type = toString.call(obj).toLowerCase();
            type = type.substring(8, type.length - 1);
        }
        return type;
    };

    CokeUtil.isPlainObject = function (obj) {
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
    };

    /**
     * 扩展方法(来自 jQuery)
     * extend([deep,] target, obj1 [, objN])
     * @base she.isPlainObject
     */
    CokeUtil.extend = function () {
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
    };


    /* 
     *
     * ---------------- Added for yym usage [start] ---------------- 
     *
     */

    CokeUtil.getYYVersion = function(){
        var yyinfo = ua.match(/.*YY([\/\(])?(ClientVersion:)?([0-9\.]+).*/);
        return (yyinfo && yyinfo[3]) || 0;
    };

    CokeUtil.getOSVersion = function(){
        var version;
        if (this.userAgent.isIOS && ua.indexOf('OS ') > -1) {
            version = ua.substr(ua.indexOf('OS ') + 3, 5).replace(/_/g, '.').replace(/[^0-9.]/g, '');
        } else if (this.userAgent.isAndroid && ua.indexOf('Android ') > -1) {
            version = ua.substr(ua.indexOf('Android ') + 8, 5).replace(/[^0-9.]/g, '');
        } else {
            version = 'unknown';
        }
        return version;
    };

    /**
     * @param {object} options, can contain below attributes,
     *          cmd: {string} indicates the command;
     *          failureFunc: {function} run this callback function 
     *              while current webview / browser does not support to open native app by command;
     */
    CokeUtil.openApp = function(options) {
        var cmd = 'yymobile://', failureFunc;
        if(options != null){
            cmd = options.cmd || cmd;
            failureFunc = (typeof options.failureFunc === 'function') ? options.failureFunc : null;
        }
        if(this.userAgent.isWeiXin){
            failureFunc && failureFunc();
        }else if(this.userAgent.isIOS){
            window.location.href = cmd;
        }else if(this.userAgent.isAndroid){
            if(!/^4.4/.test(Util.getOSVersion()) && this.userAgent.isChrome){
                failureFunc && failureFunc();
                return;
            }
            var ifr = document.createElement("iframe");
            ifr.src = cmd;
            ifr.style.display = "none";
            document.body.appendChild(ifr);
            setTimeout(function(){
                document.body.removeChild(ifr);
            }, 1000);
        }else{
            failureFunc && failureFunc();
        }
    };

    

    /* 
     *
     * ---------------- Added for yym usage [end] ---------------- 
     *
     */

    if ( typeof define === "function" && define.amd ) {
        define( "yymUtil", [], function() {
            return CokeUtil;
        });
    } else {
        window.yymUtil = window.CokeUtil = CokeUtil;
    }

})();
