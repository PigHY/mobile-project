;(function(){
    var version = 1.1;
    var win = window;
    var _hiidoDebug = win._hiidoDebug || false;
    var logger = {
        log: function() {
            if (_hiidoDebug) {
                win.console && win.console.log(arguments);
            }
        }
    };
    var hiido = {
        domain: "ylog.hiido.com",
        ipPrefix: "183.61.2.",
        ips: [91, 92, 94, 95, 96, 97, 98],
        getServerUrl: function(host) {
            host = host || this.domain;
            var ptl = "http:";
            var path = "j.gif?";
            return ptl + "//" + host + "/" + path;
        },
        randomIp: function() {
            var Rand = Math.random();
            var index = Math.round(Rand * (this.ips.length - 1));
            var suff = this.ips[index];
            return this.ipPrefix + suff;
        },
        getParam: function(opt) {
            var obj = opt;
            var param = [];
            obj.time = parseInt(1 * new Date() / 1000);
            obj.ui = this.getCookie("hiido_ui");
            if(!obj.ui){
                obj.ui = Math.random();
                var expire  = new Date();
                expire.setTime(expire.getTime() + 365*24*60*60*1000);
                this.setCookie("hiido_ui", obj.ui, expire, "/", "yy.com");
            }
            obj.username = this.getCookie("username");
            for (h in obj) {
                if (obj.hasOwnProperty(h)) {
                    param.push(encodeURIComponent(h) + "=" + (obj[h] === undefined || obj[h] === null ? "" :
                        encodeURIComponent(obj[h])))
                }
            }
            return param.join("&");
        },
        send: function(url, backurl, times) {
            var reties = times || 0;
            var img = new Image();
            var self = this;
            img.onerror = function() {
                if (reties <= 1) {
                    self.send(url, backurl, ++reties);
                } else if (reties == 2) {
                    self.send(backurl, backurl, ++reties);
                }
            }
            img.src = url;
        },
        getCookie: function(name) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                return unescape(arr[2]);
            } else {
                return null
            };
        },
        setCookie: function(name, value, expires, path, domain, secure) {
            var cookieText = name + "=" + escape (value);
            cookieText += (expires && expires instanceof Date) ? ";expires=" + expires.toGMTString() : "";
            cookieText += path ? ";path=" + path : "";
            cookieText += domain ? ";domain=" + domain : "";
            cookieText == secure ? ";secure" : "";
            document.cookie = cookieText;    
        }
    };
    var iface = {
        stat: function(opt) {
            if (!opt) {
                return false;
            }
            var svr = hiido.getServerUrl();
            var param = hiido.getParam(opt);
            var url = svr + param
            var backurl = hiido.getServerUrl(hiido.randomIp()) + param;
            hiido.send(url, backurl)
        },
        addUVToHiido: function(myWid) {
            if (toString.call(myWid) != "[object Array]") {
                _hiido_wid = [];
                _hiido_wid.push(myWid);
            }
            if (typeof _hiido_no === 'undefined') {
                _hiido_no = 0;
            }
            hiidov3();
        }
    };

    if (typeof(module) === "object") {
        module.exports = iface;
    }
    window.appHiido = iface;
})();
var statisticEvent= function(options, isApp) {
    var appOptions = {
        uid: null,
        imei: null,
        mac: null,
        sys: null
    };
    if(isApp){
        var info = window.YYApiCore.invokeClientMethod('device', 'deviceInfo');
        appOptions.uid = window.YYApiCore.invokeClientMethod('data', 'myUid', {});
        appOptions.imei = info.imei;
        appOptions.mac =  window.YYApiCore.invokeClientMethod('device', 'deviceMac');
        var system = info.system;
        if(system == "Android"){
            appOptions.sys="2";
        }
        if(system == "iOS"){
            appOptions.sys="0";
        }
    }
    var vparam = {
        "act": "webevent",
        "eventid":options.eventid,
        "value":1,
        "eventype": options.eventype||"1",
        "uid": appOptions.uid||0, // 匿名为0,
        "imei": appOptions.imei||0, // 匿名为0,
        "mac": appOptions.mac||0,
        "sys": appOptions.sys||options.sys, // Web为1,
        "act_type":options.act_type,
        "hostid": options.hostid||0,
        "sid": options.sid||0,
        "bak1": options.bak1||0,
        "bak2": options.bak2||0,
        "bak3": options.bak3||0
    };
    try {
        appHiido.stat(vparam);
    } catch (e) {}
    if (typeof callback == 'function') {
        callback(vparam);
    }
}
