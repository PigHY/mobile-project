define([], function(){
    window.testlog = function(str){
        console.log(str);
    };
    function svc_startapp(connectionCb, joinChannelCb, unicastCb, broadcastCb, chatMsgCb) {
        connCb = connectionCb;
        joinCb = joinChannelCb;
        uniCb = unicastCb;
        broCb = broadcastCb;
        chatCb = chatMsgCb;
        svc_getSvcCookie();
        window.testlog("start to connect service.");
        svc_connectPlatform();
    }

    function svc_initPlatform() {
        var initMsg = new Object();
        initMsg.uri = "0";
        if (svc_linkCookie == "") {
            initMsg.type = "1";
        } else initMsg.type = "0";
        initMsg.svc_link = svc_linkCookie;
        svc_send(JSON.stringify(initMsg));
        window.testlog("init message sent.");
    }
    svc_tid=null;
    svc_sid=null;
    function svc_joinChannel(topSid, subSid) {
        if (svc_isConnectionOk() == false) {
            if (typeof(joinCb) != "undefined" && joinCb != null)
                joinCb("-9999", "must login and startapp first.");
            return false;
        }

        window.testlog("request to join channel topSid:"+topSid+" subSid:"+subSid);
        svc_tid = topSid;
        svc_sid = subSid;
        //send join channel request over websocket
        var join = new Object();
        join.uri = "1";
        join.top_sid = topSid.toString();
        join.sub_sid = subSid.toString();
        join.svc_link = svc_linkCookie;
        var joinMsg = JSON.stringify(join);
        svc_send(joinMsg);
        window.testlog("join channel request sent. topSid:"+join.top_sid+" subSid:"+join.sub_sid+". json:"+joinMsg);
    }

    function svc_leaveChannel(leaveEventCb) {
        leaveCb = leaveEventCb;
        if (svc_isConnectionOk() == false || svc_getSvcCookie() == "") {
            if (typeof(leaveCb) != "undefined" && leaveCb != null)
                leaveCb("-9999", "must login and startapp first.");
            return false;
        }
        if(!svc_tid){
            return;
        }
        //send leave channel request over websocket
        window.testlog("request to leave channel topSid:"+svc_tid+" subSid:"+svc_sid);
        var leave = new Object();
        leave.uri = "2";
        leave.top_sid = svc_tid.toString();
        leave.sub_sid = svc_sid.toString();
        leave.svc_link = svc_linkCookie;
        var leaveMsg = JSON.stringify(leave);
        svc_send(leaveMsg);
        window.testlog("leave channel request sent. topSid:"+leave.top_sid+" subSid:"+leave.sub_sid+". json:"+leaveMsg);
    }

    /**
     * 发送聊天内容到后台
     * @param nick
     * @param msg
     * @returns {Boolean}
     */
    function svc_chatMsg(nick, msg) {
        if (svc_isConnectionOk() == false || svc_getSvcCookie() == "") {
            window.testlog("must login to send chat message.");
            return false;
        }
        
        var chat = new Object();
        chat.uri = "4";
        chat.top_sid = svc_tid;
        chat.sub_sid = svc_sid;
        chat.nick = nick;
        chat.msg = msg;
        chat.svc_link = svc_linkCookie;
        var chatMsg = JSON.stringify(chat);
        //通过WebSocket发送消息
        svc_send(chatMsg);
        
    //	window.testlog("chat msg sent. topSid:"+chat.top_sid+" subSid:"+chat.sub_sid+" nick:"+chat.nick+" msg:"+chat.msg+". json:"+chatMsg);
        return true;
    }

    function svc_getHls(cb) {
        hlsCb = cb;
        window.testlog("request to get hls address.");
        var hls = new Object();
        hls.uri = "8";
        hls.svc_link = svc_linkCookie;
        var hlsMsg = JSON.stringify(hls);
        svc_send(hlsMsg);
        window.testlog("hls request sent.");
    }

    function svc_sendMsgByAppId(appid, msg) {
        if (svc_isConnectionOk() == false) {
            window.testlog("svcMsgByAppId failed. connection already closed.");
            return false;
        }
        //send appid msg over websocket
        window.testlog("request to send svc msg, appid:"+appid+" msgLength:"+msg.length);
        var appMsg = new Object();
        appMsg.uri = "5";
        appMsg.top_sid = svc_tid;
        appMsg.sub_sid = svc_sid;
        appMsg.appid = appid;
        appMsg.msg = msg.toString();
        appMsg.svc_link = svc_linkCookie;
        var jsMsg = JSON.stringify(appMsg);
        svc_send(jsMsg);
        window.testlog("svc msg sent. topSid:"+appMsg.top_sid+" subSid:"+appMsg.sub_sid+" appid:"+appMsg.appid+" msg:"+appMsg.msg+". json:"+jsMsg);
    }

    //被T出频道
    function setKickOffCb(cb) {
        kickOffCb = cb;
    }

    /**
     * 创建WebSocket对象，绑定WebSocket的事件处理函数
     */
    function svc_connectPlatform() {
        var wsServer = 'ws://tvgw.yy.com:8181/websocket';
    //	var wsServer = 'ws://tvgw.yy.com:8193/websocket';
        try {
            svc_websocket = new WebSocket(wsServer);
        } catch (evt) {
            window.testlog("new WebSocket error:" + evt.data);
            svc_websocket = null;
            if (typeof(connCb) != "undefined" && connCb != null)
                connCb("-1", "connect error!");
            return;
        }
        svc_websocket.onopen = function (evt) { svc_onOpen(evt) }; 
        svc_websocket.onclose = function (evt) { svc_onClose(evt) }; 
        svc_websocket.onmessage = function (evt) { svc_onMessage(evt) }; 
        svc_websocket.onerror = function (evt) { svc_onError(evt) };
    }

    function svc_onOpen(evt) {
        window.testlog("Connected to WebSocket server.");
        //svc_initPlatform();
    }

    function svc_onClose(evt) { 
        window.testlog("Disconnected");
        svc_websocket = null;
        if (typeof(connCb) != "undefined" && connCb != null)
            connCb("-2", "Connection closed.");
        if (typeof(svc_aliveTimer) != "undefined") clearTimeout(svc_aliveTimer);
    }

    /**
     * 接收到服务器发来的消息时触发
     * @param evt evt.data包含服务器传过来的数据
     */
    function svc_onMessage(evt) {
        //TODO: 如果parse失败？
        var jsMsg = JSON.parse(evt.data);
        var res = jsMsg.response;//消息类型
        switch (res) {
            case "login":
                var svcLink = jsMsg.svc_link;
                if (typeof(svcLink) != "undefined" && svcLink.length != 0) {
                    svc_linkCookie = svcLink;
                    svc_setCookie("svc_link", svcLink);
                }
                svc_initPlatform();
            break;
            case "init":
                if (typeof(connCb) != "undefined" && connCb != null)
                    connCb("0", "Connected with service platform.");
                svc_keepAlive();
            break;
            case "join":
                if (typeof(joinCb) != "undefined" && joinCb != null)
                    joinCb(jsMsg.result, jsMsg.message);
                else
                    window.testlog("joinCb not set. none to notify.");
            break;
            case "leave":
                if (typeof(leaveCb) != "undefined" && leaveCb != null)
                    leaveCb();
                else
                    window.testlog("leaveCb not set. none to notify.");
            break;
            case "unicast"://单播通道
                if (typeof(uniCb) != "undefined" && uniCb != null)
                    //参数：appid、消息内容
                    uniCb(jsMsg.appid, jsMsg.msg);
                else
                    window.testlog("!!! uniCb not set. please check!");
            break;
            case "broadcast"://广播通道 
                if (typeof(broCb) != "undefined" && broCb != null)
                    //参数：appid、顶级频道号、消息内容 
                    broCb(jsMsg.appid, jsMsg.top_sid, jsMsg.msg);
                else
                    window.testlog("!!! broCb not set. please check!");
            break;
            case "chat":
                if (typeof(chatCb) != "undefined" && chatCb != null)
                    chatCb(jsMsg);
                else
                    window.testlog("!!! chatCb not set. please check!");
            break;
            case "keepalive":
                window.testlog("recv server keepalive, ts:"+jsMsg.ts);
            break;
            case "hls":
                window.testlog("recv hls live address, hls:"+jsMsg.url);
                if (typeof(hlsCb) != "undefined" && hlsCb != null) {
                    hlsCb(jsMsg.url);
                }
            break;
            case "kickoff":
                window.testlog("kickoff by admin:"+ jsMsg.admin + " topSid:" + jsMsg.top_sid + " subSid:" + jsMsg.sub_sid);
                if (typeof(kickOffCb) != "undefined" && kickOffCb != null) {
                    kickOffCb(jsMsg.admin, jsMsg.top_sid, jsMsg.sub_sid, jsMsg.ban_time);
                }
            break;
            default:
                window.testlog("unrecognized response:"+res+" data:"+evt.data);
            break;
        }
    }

    function svc_onError(evt) {
        window.testlog('Error occured: ' + evt.data);
        svc_websocket = null;
        connFailCb();
        if (typeof(svc_aliveTimer) != "undefined") clearTimeout(svc_aliveTimer);
    }

    function svc_keepAlive() {
        if (svc_websocket.readyState == WebSocket.OPEN) {
            //TODO:timer的启停逻辑
            //send keep alive over websocket
            var timestamp = (new Date()).valueOf().toString();
            var ping = new Object();
            ping.uri = "6";
            ping.ts = timestamp;
            ping.svc_link = svc_linkCookie;
            svc_send(JSON.stringify(ping));
            window.testlog("sending keep alive message. ts:"+timestamp);
            //15 seconds
            svc_aliveTimer = setTimeout("svc_keepAlive()",15000);
        } else {
            svc_websocket.close();
            svc_connectPlatform();
        }
    }

    /**
     * 调用WebSocket的接口向后台发送消息
     */
    function svc_send(msg) {
        if (svc_websocket.readyState == WebSocket.OPEN) {
            svc_websocket.send(msg);
        } else {
            window.testlog("send failed. websocket not open. please check.");
        }
    }

    function svc_getCookie(name) {
        if (document.cookie.length>0) {
            var startPos = document.cookie.indexOf(name + "=")
            if (startPos != -1){
                startPos = startPos + name.length+1;
                var endPos = document.cookie.indexOf(";", startPos);
                if (endPos == -1) endPos=document.cookie.length;
                var cookie = unescape(document.cookie.substring(startPos, endPos));
                window.testlog("get cookie "+name + ":"+cookie);
                return cookie;
            }
        }
        return "";
    }

    function svc_getSvcCookie() {
        if (typeof(svc_linkCookie) != "undefined" && svc_linkCookie.length != 0) {
            return svc_linkCookie;
        } else {
            svc_linkCookie = svc_getCookie("svc_link");
            return svc_linkCookie;
        }
    }

    function svc_setCookie(name, value){
        document.cookie = name + "=" + escape(value)+";domain=.yy.com";
    }

    function svc_isConnectionOk() {
        if (typeof(svc_websocket) == "undefined" || svc_websocket == null) {
            window.testlog("websocket not ready. already startapp? network problem?");
            return false;
        }
        return true;
    }
    

    var svc = {
        'svc_startapp': svc_startapp,
        'svc_initPlatform': svc_initPlatform,
        'svc_joinChannel': svc_joinChannel,
        'svc_leaveChannel': svc_leaveChannel,
        'svc_chatMsg': svc_chatMsg,
        'svc_getHls': svc_getHls,
        'svc_sendMsgByAppId': svc_sendMsgByAppId,
        'setKickOffCb': setKickOffCb,
        'svc_connectPlatform': svc_connectPlatform,
        'svc_onOpen': svc_onOpen,
        'svc_onClose': svc_onClose,
        'svc_onMessage': svc_onMessage,
        'svc_onError': svc_onError,
        'svc_keepAlive': svc_keepAlive,
        'svc_send': svc_send,
        'svc_getCookie': svc_getCookie,
        'svc_getSvcCookie': svc_getSvcCookie,
        'svc_setCookie': svc_setCookie,
        'svc_isConnectionOk': svc_isConnectionOk
    };

    for(var key in svc){
        if(svc.hasOwnProperty(key)){
            window[key] = svc[key];
        }
    }

    return svc;


});

