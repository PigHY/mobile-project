define(['zepto', 'util', 'wLoading', 'svc'], function($, util, wLoading, svc){
    var UA = util.UA;

    var player = {
        debug: ~location.href.indexOf('debug'),

        // 参数设置
        options: { 
            // 接口
            interface: {
                liveUrl: "http://hls.yy.com/live/@sid_@ssid.m3u8?id=yyent&uid=@uid&appid=@appid",
                videoInfo: '/anchor/channel/{$uid}/1?pid={$pid}',
                statusInfo: '/anchor/channel/{$uid}/0?pid={$pid}',
                danmuZan: '/share/webGetTape/{$time}?pid={$pid}'
            },

            // 是否全屏
            fullPage: false,

            widget: {
                // 点赞 设置
                zan: {
                    // 是否显示赞
                    enable: false,
                    tpl: [
                        '<i class="liveplayer-widget-zan-item {$class} {$direct}" style="width: {$width}%; height: {$height}%">',
                            '<i></i>',
                        '</i>'
                    ].join(''),
                    typeArr: [
                        'liveplayer-widget-zan-item-type01',
                        'liveplayer-widget-zan-item-type02',
                        'liveplayer-widget-zan-item-type03',
                        'liveplayer-widget-zan-item-type04',
                        'liveplayer-widget-zan-item-type05',
                        'liveplayer-widget-zan-item-type06',
                        'liveplayer-widget-zan-item-type07',
                        'liveplayer-widget-zan-item-type08',
                        'liveplayer-widget-zan-item-type09'
                    ],
                    directArr: [
                        'liveplayer-widget-zan-item-direct01',
                        'liveplayer-widget-zan-item-direct02'
                    ],
                    width: {
                        min: 10,
                        max: 21
                    },
                    height: {
                        min: 40,
                        max: 80
                    },
                    // 每个点赞相隔时间
                    delay: 500,
                    // 动画持续时间 ms
                    transition: 5000,

                    // 同屏最多展示数
                    limit: 15
                },

                // 弹幕 设置
                danmu: {
                    // 是否显示弹幕
                    enable: false,
                    el: '.liveplayer-widget-danmu',
                    tpl: [
                        '<div class="liveplayer-widget-danmu-item" style="bottom: {$bottom}%">',
                            '<div class="liveplayer-widget-danmu-item-main">',
                                '<span class="liveplayer-widget-danmu-item-cover" style="background-image:{$cover}"></span>',
                                '<span class="liveplayer-widget-danmu-item-txt">{$text}</span>',
                            '</div>',
                        '</div>'
                    ].join(''),
                    bottom: [5, 30, 55, 80],
                    // 动画持续时间 ms
                    transition: 12000,

                    // 同一 id 允许每隔几秒出现一次弹幕 单位 ms
                    limitInterval: 0
                }
            },

            // 播放区域高度
            height: '5.625rem',

            // 是否显示观看人数
            visitedNum: true,

            // 信息参数
            info: {
                appid: 0,
                uid: 0,
                pid: '',

                md5Hash: '',

                // 预告用参数
                trailerUrl: '',
                trailerPoster: ''
            },

            tpl: [
                '<div class="liveplayer">',
                    '<div class="liveplayer-main">',
                        '<video v-el="video" webkit-playsinline width="100%"></video>',
                    '</div>',
                    '<div class="liveplayer-poster" v-el="poster"></div>',
                    '<div class="liveplayer-playbtn" v-el="btn"></div>',
                    '<div class="liveplayer-widget-msgArea"><span v-el="msg"></span></div>',
                    '<div class="liveplayer-widget-statusbarArea" v-el="statusbar"></div>',
                    '<div class="liveplayer-widget-zan" v-el="zan"></div>',
                    '<div class="liveplayer-widget-danmu" v-el="danmu"></div>',
                    '<div class="liveplayer-widget-loadingArea" v-el="loading">',
                        '<span class="liveplayer-widget-loading-item">',
                            '<i class="liveplayer-widget-loading-item-s1"></i>',
                            '<i class="liveplayer-widget-loading-item-s2"></i>',
                            '<i class="liveplayer-widget-loading-item-s3">',
                                '<i class="liveplayer-widget-loading-item-s3-1"></i>',
                                '<i class="liveplayer-widget-loading-item-s3-2"></i>',
                            '</i>',
                        '</span>',
                    '</div>',
                    '<a href="javascript:;" class="liveplayer-widget-footmsg" v-el="footmsg"></a>',
                '</div>'
            ].join(''),
            
            // 样式
            classes: {
                ready: 'liveplayer-status-ready',
                noposter: 'liveplayer-status-noposter',
                loading: 'liveplayer-status-loading',
                msg: 'liveplayer-status-msg',
                playing: 'liveplayer-status-playing',
                videoOnplay: 'liveplayer-status-video-onplay',
                liveOnplay: 'liveplayer-status-live-onplay',
                nowidget: 'liveplayer-status-nowidget',
                hidevideo: 'liveplayer-status-hidevideo',
                onplayNoBtn: 'liveplayer-status-onplayNoBtn',
                noplaybtn: 'liveplayer-status-noplaybtn',
                novisitNum: 'liveplayer-status-novisitNum'
            },

            // 类型： topic | share
            type: 'topic',

            // 首次请求完成时回调函数
            onload: function(data){},

            // 播放时回调函数
            onplay: function(){},

            // 中断重连提示按钮点击回调
            onrelink: function(){}

        },
        source: {
            appid: '',
            uid: '',
            pid: '',
            md5Hash: '',
            visitedNum: 0
        },
        el: {
            wrapper: undefined,
            poster: undefined,
            video: undefined,
            btn: undefined,
            msg: undefined,
            loading: undefined,
            statusbar: undefined,
            zan: undefined,
            danmu: undefined,
            outset: undefined
        },

        request: function(type, done){
            var she = this,
                op = she.options,
                source = she.source,
                iUrl = '';


            switch(type){
                case 'statusInfo':
                    iUrl = op.interface.statusInfo
                        .replace('{$uid}', source.uid)
                        .replace('{$pid}', source.pid);
                    break;


                case 'videoInfo':
                    iUrl = op.interface.videoInfo
                        .replace('{$uid}', source.uid)
                        .replace('{$pid}', source.pid);
                    break;
            }
            widget.loading.show();

            // status:
            // 0 - 正在直播
            // 1 - 服务异常
            // 2 - 视频录播中
            // 3 - 视频录播完成可以播放
            // 4 - 录播失败
            // 5 - 违规视频
            $.ajax({
                url: iUrl,
                dataType: 'json',
                error: function() {
                    widget.loading.hide();
                    widget.msg('error');
                },
                success: function(rs) {
                    widget.loading.hide();

                    if (!rs || rs.code !== 0) {
                        widget.msg('error');
                        return;
                    }

                    done(rs.data);
                }
            });
        },

        init: function(target, options){
            var she = this;
            var op = she.options = util.extend(true, she.options, options);
            var source = she.source = util.extend(true, she.source, op.info);
            var info = op.info;

            she.el.wrapper = $(target)[0];

            $(target).append(op.tpl);

            she.reset();

            if(!source.uid){
                widget.msg('playend');
                return;
            }

            she.request('videoInfo', function(data){
                she.source.sid = data.sid;
                she.source.ssid = data.ssid || she.source.sid;
                she.source.appid = data.appid;
                she.source.visitedNum = data.total;


                var iType;

                switch(op.type){
                    case 'topic':
                        switch(data.status){
                            // 直播
                            case 0:
                                iType = 'live';
                                she.live.init(data.snapshot);
                                break;


                            default:
                                // 回放
                                if(she.source.pid){
                                    iType = 'replay';
                                    she.replay.init(data);

                                // 预告
                                } else {
                                    iType = 'trailer';
                                    she.trailer.init();

                                }
                                break;


                        }
                        break;


                    case 'share':
                        switch(data.status){
                            // 直播
                            case 0:
                                iType = 'live';
                                she.live.init(data.snapshot);
                                break;

                            // 回放
                            case 3:
                                iType = 'replay';
                                she.replay.init(data);
                                break;
                                
                            // 服务异常
                            case 1:
                            // 视频录播中
                            case 2:
                            // 录播失败
                            case 4:
                                widget.msg('recording');
                                
                                break;
                            // 违规视频
                            case 5:
                                widget.msg('violation');
                                break;
                        }
                        break;

                }

                // 隐藏 观看人数
                if(!op.visitedNum){
                    $(she.el.wrapper).addClass(op.classes.novisitNum);
                }

                $(she.el.wrapper).addClass(op.classes.ready);

                // 状态栏
                widget.statusbar.init(iType, she.source.visitedNum);

                op.onload && op.onload(data);

            });



        },
        // 预告
        trailer: {
            init: function(){
                var she = player,
                    op = player.options,
                    source = she.source;

                she.video.init(op.info.trailerUrl, op.info.trailerPoster);

                // 定时轮询接口看是否已开始直播
                var checkKey = setInterval(function(){
                    she.request('statusInfo', function(data){
                        if(data.status === 0){
                            clearInterval(checkKey);
                            source.sid = data.sid;
                            source.ssid = data.ssid || source.sid;

                            // 直播初始化
                            she.live.init();

                        }
                    });
                }, 5000);
            }
        },
        // 直播
        live: {
            init: function(poster){
                var she = player,
                    op = she.options,
                    source = she.source;

                she.reset();

                // 设置封面图
                if(poster){
                    $(she.el.poster).css("background-image", "url(" + poster + ")");
                    $(she.el.video).attr("poster", poster);
                }

                if(UA.IOS && UA.IOS == 7){
                    $(she.el.video).removeAttr("webkit-playsinline");
                    $(she.el.wrapper).addClass(op.classes.hidevideo);
                }



                /* call yyLivePlayer plugin [start] */
                var myPlayer = new YYLivePlayer($, {
                    sid: source.sid,
                    ssid: source.ssid,
                    // 防盗链用 uid
                    uid: source.md5Hash,
                    liveid: source.uid,
                    appid: source.appid,
                    liveURL: op.interface.liveUrl,
                    wrapper: she.el.outset,
                    poster: she.el.poster,
                    player: she.el.video,
                    playBtn: she.el.btn,
                    autoplay: true,
                    hasPoster: true,
                    hasPauseBtn: false,
                    eventListeners: {
                        'yylive_noStream': function() {
                            widget.msg('playend');
                            she.replay.init();
                        },
                        'yylive_endStream': function() {
                            widget.msg('playend');
                            she.replay.init();
                        }
                    },
                    nonsupportHandler: function() {
                        widget.msg('notsupport');

                    },
                    liveInfoFunc: function(handlers) {
                        var she = player,
                            op = she.options;

                        var that = this;
                        she.request('statusInfo', function(data){
                            if(data.status == 0){
                                handlers.succHandler();
                            } else {
                                handlers.failHandler();
                            }

                        });
                        
                    }
                });

                myPlayer.bindEvent('play', function() {
                    $(she.el.wrapper).addClass(op.classes.playing);

                    // 播放回调函数
                    op.onplay && op.onplay();
                });

                myPlayer.bindEvent('pause', function() {
                    $(she.el.wrapper).removeClass(op.classes.playing);

                }).bindEvent('error', function() {
                    $(she.el.wrapper).removeClass(op.classes.playing);

                }).bindEvent('ended', function() {
                    $(she.el.wrapper).removeClass(op.classes.playing);

                    if(type == 'share'){
                        widget.msg('recording');
                    }

                });

                myPlayer.poster.click(function() {
                    myPlayer.playVideo();
                });

                myPlayer.playBtn.click(function() {
                    myPlayer.playVideo();
                });

                myPlayer.player.click(function() {
                    myPlayer.playVideo();
                });

                $(she.el.wrapper).addClass(op.classes.liveOnplay);


                // 弹幕 & 赞
                if((op.widget.zan.enable || op.widget.danmu.enable) && widget.isSupported){
                    var
                        dataHandle = function(json) {
                            if (she.el.video.paused && !she.debug) {
                                return;
                            }

                            // 点赞
                            if (json.ballot) {
                                widget.zan.add(json.ballot);
                            }

                            // 弹幕
                            if (json.msg) {
                                widget.danmu.add(widget.danmu.dataFormat(json.msg));
                            }

                            if (json.chat_msg) {
                                widget.danmu.add(widget.danmu.dataFormat(json.chat_msg));
                            }

                        };

                        svc.svc_startapp(function(code, msg) { // 连接事件回调
                        svc.svc_joinChannel(source.sid, source.ssid);

                    }, function(code, msg) { // 进频道结果回调

                    }, function(appid, msg) { // 单播数据回调
                        try {
                            dataHandle(JSON.parse(msg));
                        } catch (er) {}

                    }, function(appid, topsid, msg) { // 广播数据回调

                        try {
                            dataHandle(JSON.parse(msg));
                        } catch (er) {}

                    }, function(json) {
                        // dataHandle(json);

                    }); // 收到公屏聊天消息的回调

                }
                
            }
        },
        // 回放
        replay: {
            /* +弹幕 &赞 用参数 */
            timeMap: {},
            isUpdating: false, // 是否正在拉取数据
            currentTime: -1, // 当前播放进度所在时间
            num: 0,
            widgetUpdate: function(uid, time) {
                var 
                    she = player,
                    self = this,
                    curTime = parseInt(time, 10),
                    timeMap = self.timeMap,
                    curTimeHandle = function() {
                        var iObj = timeMap[self.currentTime],
                            padding = 0,
                            doneCheck = function() {
                                if (!padding) {
                                    iObj.show = false;
                                }

                            };
                        if (!iObj || iObj.show) {
                            return;
                        }

                        if (iObj.msg) {
                            iObj.show = true;
                            padding++;
                            fn.danmu.add(iObj.msg, function() {
                                padding--;
                                doneCheck();
                            });
                        }

                        if (parseInt(iObj.ballots, 10)) {
                            iObj.show = true;
                            padding++;
                            fn.zan.add(iObj.ballots, function() {
                                padding--;
                                doneCheck();
                            });
                        }

                    };

                if (!fn.isSupported) {
                    return;
                }


                if (curTime == self.currentTime) {
                    return;

                } else {
                    self.currentTime = curTime;
                }

                if (!timeMap[curTime]) {
                    if (she.isUpdating) {
                        return;
                    }

                    self.isUpdating = true;
                    var ajaxTime = curTime - (curTime % 60);
                    $.get(self.interface.danmuZan.replace('{$pid}', queryInfo.pid).replace('{$time}', ajaxTime), function(json) {

                        if (json.code !== 0) {
                            //请求失败
                            return;
                        }

                        var data = $.parseJSON(json.data.jsonData);

                        var beginTime = data.begin_time,
                            durationTime = data.duration_time,
                            endTime = beginTime + durationTime,
                            zanTotal = data.ballot_count || 0,
                            zanASecond = zanTotal / durationTime,
                            nowTime = beginTime,
                            danmuCnt = data.discuss_map || [],
                            zanCups = 0,
                            iObj;

                        // 计算当前 赞的 增量（当拖动进度时 会计算出错，无解）
                        for (var key in self.timeMap) {
                            if (key < beginTime) {
                                zanTotal -= self.timeMap[key].ballots;

                            } else {
                                break;
                            }
                        }

                        // 数据时间轴记录
                        for (; nowTime < endTime; nowTime++) {

                            iObj = {
                                msg: undefined,
                                ballots: 0,
                                show: false
                            };

                            // 弹幕 数据填充
                            if (danmuCnt[nowTime]) {
                                iObj.msg = fn.danmu.dataFormat(danmuCnt[nowTime]);
                            }

                            // 赞数据填充
                            zanCups += zanASecond;
                            if (zanCups > 1 && nowTime > 0) {
                                iObj.ballots = Math.floor(zanCups);
                                zanCups -= iObj.ballots;
                            }

                            // 赋值
                            timeMap[nowTime] = iObj;
                        }


                        curTimeHandle();

                        self.isUpdating = false;
                    }, 'json');


                } else {
                    curTimeHandle();
                }


            },
            /* -弹幕 &赞 用参数 */
            init: function(resData){
                var she = player,
                    self = this,
                    op = player.options,
                    source = she.source,
                    isAgain = false;

                new util.Promise(function(data, next){
                    if(data){
                        next(data);
                    } else {
                        she.request('videoInfo', next);
                    }

                }).then(function(data, next, prev){

                    if (data.status === 0 && source.sid) {
                        location.reload();

                    } else if (data.status === 3 && data.replayUrl) { // 回放
                        she.video.init(data.replayUrl, data.replaySnapshot);
                        next(data);

                    } else if (data.status === 5) {
                        she.msg('violation');

                    } else {
                        if (!isAgain) {
                            setTimeout(function() {
                                isAgain = true;
                                prev(false);

                            }, 5000);

                        } else {
                            widget.msg('playend');
                        }
                    }

                // 中断重连
                }).then(function(data, next){
                    if(type == 'share'){
                        she.relink.init(data);
                    }

                    next();
                }).then(function(next){
                    // 弹幕 & 赞
                    if ((op.widget.zan.enable || op.widget.danmu.enable) && widget.isSupported) {
                        self.widgetUpdate(source.uid, 0);

                        $(she.el.video).on('timeupdate', function(){
                            if (this.fixTime === undefined && this.currentTime != 0) { // 修复时间轴不准确问题
                                this.fixTime = this.currentTime > 10 ? this.currentTime : 0;
                            }
                            var fixTime = this.fixTime || 0;
                            var currentTime = $('#replayPlayer')[0].currentTime - fixTime;

                            // 显示当前时间轴组件内容
                            self.widgetUpdate(source.uid, currentTime);
                        });
                    }
                    next();

                }).start(resData);

            },
            
        },

        

        resize: function(){ ///{ 
            var she = this,
                op = she.options,
                iHeight = 0,
                winHeight = $(window).height();

            if(op.height && !op.fullPage){
                iHeight = op.height + (!isNaN(op.height)? 'px': '');

            } else if(op.fullPage){
                switch(typeof op.fullPage){
                    case 'number':
                        iHeight = winHeight - op.fullPage;
                        break;

                    case 'string':
                        iHeight = winHeight - (parseInt(op.fullPage, 10) || 0);
                        break;

                    case 'object':
                        iHeight = winHeight;
                        $(op.fullPage).each(function(){
                            iHeight -= $(this + '').height();
                        });
                        break;
                }

                iHeight += 'px';

            }
            she.el.video.style.height = iHeight;
        },///}

        reset: function(){ ///{ 
            var 
                she = this,
                op = she.options;

            if(she.el.video && (!she.el.video.src || she.el.video.src == window.location.href)){
                return;
            }


            if(she.el.video){
                she.el.video.pause();
                she.el.video.src = '';
            }

            $(she.el.wrapper).empty();
            $(she.el.wrapper).html(op.tpl);

            // el 赋值
            $(she.el.wrapper).find('*').each(function(i, item){
                var iAttr = $(this).attr('v-el');

                if(iAttr){
                    she.el[iAttr] = this;
                    this.removeAttribute('v-el');
                }

            });

            // 清除 class
            for(var key in op.classes){
                if(op.classes.hasOwnProperty(key)){
                    $(she.el.wrapper).removeClass(op.classes[key]);
                }
            }

            if(UA.IOS && (UA.Weixin || UA.Safari)){
                $(she.el.wrapper).addClass(op.classes.onplayNoBtn);
            }
            she.resize();
        },///}
        
        // 播放组件
        video: { ///{
            init: function(url, poster){
                var she = player,
                    op = she.options;

                she.reset();
                
                she.el.video.src = url;

                if(poster){
                    $(she.el.poster).css("background-image", "url(" + poster + ")");
                    $(she.el.video).attr("poster", poster);

                } else {
                    $(she.el.poster).css("background-image", "");
                    $(she.el.video).attr("poster", '');
                }


                if((UA.IOS && !UA.Weixin && !UA.UCBrowser && !UA.QQ)){
                    $(she.el.wrapper).addClass(op.classes.nowidget).addClass(op.classes.noposter);

                } else {
                    if((UA.IOS && UA.QQ) || UA.UCBrowser){
                        $(she.el.video).addClass(op.classes.hidevideo);
                    }

                }


                if(UA.IOS && UA.IOS == 7){
                    $(she.el.video).removeAttr("webkit-playsinline");
                    $(she.el.wrapper).addClass(op.classes.noplaybtn);
                }

                $(she.el.btn).click(function(){
                    $(she.el.wrapper).addClass(op.classes.videoOnplay);
                    if(she.el.video.paused){
                        $(she.el.video).get(0).play();

                    } else {
                        $(she.el.video).get(0).pause();

                    }

                });

                $(she.el.video).on('play', function(){
                    she.switchPlayPauseBtn(true);

                    $(she.el.wrapper).removeClass(op.classes.hidevideo);

                    if(UA.IOS && !UA.UCBrowser && !UA.Weixin){
                        if($(she.el.wrapper).hasClass(op.classes.nowidget)){
                            $(she.el.wrapper).removeClass(op.classes.nowidget);
                        }
                    }

                    op.onplay && op.onplay();

                }).on('pause', function(){
                    she.switchPlayPauseBtn(false);

                }).on('ended', function(){

                    she.switchPlayPauseBtn(false);
                    if (UA.IOS && !UA.Weixin) {
                        var vsrc = $(she.el.video).attr('src');
                        $(she.el.video).attr('src', '');
                        setTimeout(function() {
                            $(she.el.video).attr('src', vsrc);
                        }, 500);
                        return;
                    }

                    $(she.el.wrapper).addClass(op.classes.hidevideo);

                }).on('timeupdate', function() {
                
                    var that = this;
                    if (!$(that).attr('hasTU')) {
                        $(that).attr('hasTU', +new Date());
                        var ts = setInterval(function() {
                            if ((+new Date()) - parseInt($(that).attr('hasTU'), 10) > 1200) {
                                $(that).trigger('pause');
                                $(that).attr('hasTU', '');
                                clearInterval(ts);
                            }
                        }, 500);
                    } else {
                        $(that).attr('hasTU', +new Date());
                    }
                    she.switchPlayPauseBtn(true);

                /*
                 * code: 
                 * 1 - 取回过程被用户终止 
                 * 2 - 下载时发生错误 
                 * 3 - 解码时发生错误 
                 * 4 - 不支持音频、视频
                 */
                }).on('error', function(){ 
                    var self = this,
                        limit = self.limit;

                    if(limit){
                        limit--;
                        if(self.error.code == 4){
                            self.load();
                            return;

                                self.pause();
                                self.play();
                        } else {
                            setTimeout(function(){
                                self.pause();
                                self.play();
                            }, 500);
                        }
                    }
                });

            }
        },///}

        // 中断重连
        relink: {
            interval: 5000,

            init: function(data){
                this.check(data);
            },
            check: function(data){
                var she = player,
                    self = this,
                    source = she.source;

                clearTimeout(self.timeoutKey);

                if(data && !data.contQuery){
                    if(data.livingPid && source.pid != data.livingPid && data.status == 0){
                        source.livingPid = rs.data.livingPid;
                        widget.msg('relink');
                    }
                } else {
                    self.timeoutKey = setTimeout(function(){
                        she.request('statusInfo', function(data){
                            self.check(data);
                        });

                    }, self.interval);

                }
            }
        },

        // 播放按钮
        switchPlayPauseBtn: function(isPlaying) {
            var she = this,
                op = she.options;

            if (UA.IOS && !UA.Weixin && !UA.UCBrowser && !UA.QQ) {
                return;
            }
            if (isPlaying) {
                $(she.el.wrapper).addClass(op.classes.playing);

            } else {
                $(she.el.wrapper).removeClass(op.classes.playing);
            }

        },

        error: function(){
            widget.msg.apply(widget, Array.prototype.slice.call(arguments));
        }
    };


    var fn = {
        type: function(source) {
            return Object.prototype.toString.call(source).replace(/\[object (.*)\]/, '$1').toLowerCase();
        },

        parseXML: function(data) {
            var xml, tmp;
            if (!data || typeof data !== "string") {
                return null;
            }
            try {
                if (window.DOMParser) { // Standard
                    tmp = new DOMParser();
                    xml = tmp.parseFromString(data, "text/xml");
                } else { // IE
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }
            } catch (e) {
                xml = undefined;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                // error
            }
            return xml;

        }

    };


    // 各种控件
    var widget = {
        // 是否支持 弹幕、 赞
        isSupported: UA.Weixin || (!(UA.IOS && UA.IOS == 7) && !(UA.IOS && UA.Weibo)),

        // 弹幕
        danmu: { ///{
            currentNum: 0,
            // 数据源（函数用变量）
            sourceMap: {
                // 用户列表
                uids: {},
                // 位置列表
                positions: [],
                // 弹幕总数
                count: 0
            },
            random: function() {
                var she = player,
                    self = this,
                    op = she.options.widget.danmu,
                    sourceMap = self.sourceMap,
                    iPos = op.bottom,
                    iFront,
                    iPositions = sourceMap.positions,
                    iSiblings;


                // 初始化序列
                if (!iPositions.length) {
                    iPositions = [Math.round(Math.random() * (iPos.length - 1))];
                    while (iPositions.length < 50) {
                        iFront = iPositions.pop();
                        iPositions = iPositions.concat(
                            iPos.sort(function(a, b) {
                                if (b == iFront) {
                                    return 1;
                                } else {
                                    return Math.random() - 0.5;
                                }
                            })
                        );
                    }

                    sourceMap.positions = iPositions;
                }

                return iPositions[self.currentNum++ % iPositions.length];

            },
            dataFormat: function(source) {
                var 
                    r = [],
                    iData;

                if (fn.type(source) == 'object') {
                    return source;
                }

                if (fn.type(source) == 'array') {
                    iData = source;

                } else {
                    iData = [source];

                }
                $(iData).each(function(i, xmlStr) {
                    var iXml = fn.parseXML(xmlStr),
                        $xml = $(iXml);


                    $xml.find('msg').each(function() {
                        r.push({
                            cover: $(this).find('img').attr('url'),
                            text: $(this).find('txt').attr('data')
                        });
                    });


                });
                return r;

            },
            add: function(data, done) {
                var
                    iData,
                    she = player,
                    self = this,
                    op = she.options.widget.danmu;

                if (fn.type(data) == 'array') {
                    iData = data;

                } else {
                    iData = [data];
                }

                var
                    padding = iData.length,
                    doneCheck = function() {
                        padding--;
                        if (!padding && done) {
                            done();
                        }
                    };


                $(iData).each(function() {
                    var fd = document.createElement("div"),
                        data = this,
                        iCover = decodeURIComponent(data.cover);


                    iCover = iCover ? 'url(' + iCover + ')' : "";

                    fd.innerHTML = op.tpl
                        .replace('{$bottom}', self.random())
                        .replace('{$cover}', iCover)
                        .replace('{$text}', data.text);


                    var item = fd.children[0];

                    $(she.el.danmu).append(item);
                    $(item).addClass('liveplayer-widget-danmu-ani');


                    // setTimeout(function() {
                    //     item.parentNode.removeChild(item);
                    //     doneCheck();

                    // }, op.transition);

                });

            }
        },///}

        // 点赞
        zan: {///{
            // 当前展示的点赞数
            currentNum: 0,

            random: function(type) {
                var op = player.options.widget.zan,
                    iRandom = function(min, max) {
                        return min + Math.round(Math.random() * (max - min));
                    };

                switch (type) {
                    case 'class':
                        return op.typeArr[iRandom(0, op.typeArr.length - 1)];

                    case 'width':
                        return iRandom(op.width.min, op.width.max);

                    case 'height':
                        return iRandom(op.height.min, op.height.max);

                    case 'direct':
                        return op.directArr[iRandom(0, op.directArr.length - 1)];

                    default:
                        return '';
                }

            },

            add: function(num, done) {
                if (isNaN(num)) {
                    num = 1;
                } else {
                    num = parseInt(num, 10);
                }

                var
                    she = player,
                    self = this,
                    fd = document.createElement("div"),
                    op = she.options.widget.zan,
                    padding = num,
                    doneCheck = function() {
                        padding--;
                        if (!padding && done) {
                            done();
                        }

                    },
                    itemBuild = function(i) {
                        if (self.currentNum >= op.limit) {
                            return doneCheck();;
                        }

                        self.currentNum++;

                        var iDelay = i * op.delay,
                            fd = document.createElement("div"),
                            item;


                        fd.innerHTML = op.tpl
                            .replace('{$class}', self.random('class'))
                            .replace('{$direct}', self.random('direct'))
                            .replace('{$width}', self.random('width'))
                            .replace('{$height}', self.random('height'));


                        item = fd.children[0];

                        setTimeout(function() {
                            $(player.el.zan).append(item);
                            $(item).addClass('liveplayer-widget-zan-item-ani');
                            setTimeout(function() {
                                item.parentNode.removeChild(item);

                                self.currentNum--;
                                doneCheck();

                            }, op.transition);

                        }, iDelay);


                    };

                for (var i = 0; i < num; i++) {
                    itemBuild(i);
                }

            }

        },///}
        // 菊花
        loading: {///{
            show: function(){
                var she = player,
                    op = she.options;
                $(player.el.wrapper).addClass(op.classes.loading);

            },
            hide: function(){
                var she = player,
                    op = she.options;
                $(she.el.wrapper).removeClass(op.classes.loading);

            }
        },///}
        // 消息
        msg: function(type, ctx){///{
            var she = player,
                self = this,
                op = she.options,
                source = she.source;

            clearTimeout(self.msg.timeoutKey);

            switch(type){
                case 'playend': // 播放结束
                    $(she.el.wrapper).addClass(op.classes.msg);
                    $(she.el.msg).html('播放已结束');
                    break;

                case 'violation': // 违规
                    $(she.el.wrapper).addClass(op.classes.msg);
                    $(she.el.msg).html('该内容已经违规');
                    break;

                case 'notsupport': // 不支持
                    $(she.el.wrapper).addClass(op.classes.msg);
                    $(she.el.msg).html('本页面暂无法在您的设备上提供良好的体验');
                    break;

                case 'recording':
                    $(she.el.wrapper).addClass(op.classes.msg);
                    $(she.el.msg).html('别走开，精彩录播马上开始');

                    var repeatTime = 3,
                        interval = 5000;

                    !function doit(){
                        repeatTime--;
                        she.request('statusInfo', function(data){
                            if(data.livingPid){
                                she.source.livingPid = data.livingPid;
                                she.relink.show();
                            }
                            var needRepeat = false;


                            switch(data.status){
                                case 0:
                                    location.reload();
                                    break;

                                case 3:
                                    if(data.replayUrl){
                                        she.el.video.pause();
                                        she.replay.init(data);
                                    } else {
                                        needRepeat = true;
                                    }
                                    break;

                                case 5:
                                    self.msg('violation');
                                    break;

                                default:
                                    needRepeat = true;
                                    break;
                            }

                            if(needRepeat){
                                if(repeatTime){
                                    self.msg.timeoutKey = setTimeout(doit, interval)
                                    
                                } else {
                                    self.msg('playend');

                                }
                            }

                        });

                    }();
                    break;

                case 'relink':
                    if(source.livingPid && source.livingPid != source.pid){
                        $(she.el.wrapper).addClass(op.classes.footMsg);
                        $(she.el.footMsg).html('主播回到直播间啦，快点我去看直播吧~')
                            .attr('href', '/s/share/share.html?u='+ source.uid +'&pid=' + source.livingPid)
                            .click(function(){
                                op.onrelink && op.onrelink();
                            });
                    }
                    break;

                case 'footMsg':
                    $(she.el.wrapper).addClass(op.classes.footMsg);
                    $(she.el.footMsg).html(ctx);
                    break;

                default:
                    break;
            }
        },///}
        // 状态栏
        statusbar: {///{
            options: {
                tpl: [
                    '<div class="liveplayer-widget-statusbar {$class}">',
                        '<i class="liveplayer-widget-statusbar-txt">{$text}</i>',
                        '<span class="liveplayer-widget-statusbar-count">{$num}人看过</span>',
                    '</div>'
                ].join(''),

                status: {
                    'replay':{
                        class: 'liveplayer-widget-statusbar-type-replay',
                        text: '回放'
                    },
                    'live': {
                        class: 'liveplayer-widget-statusbar-type-live',
                        text: '直播'
                    },
                    'trailer': {
                        class: 'liveplayer-widget-statusbar-type-trailer',
                        text: '预告'
                    }
                }
            },
            
            init: function(type, count){
                var she = player,
                    op = she.options,
                    iStu = this.options.status[type],
                    iOp = this.options;

                if(!iStu){
                    return;
                }
                var iHtml = iOp.tpl
                    .replace('{$class}', iStu.class)
                    .replace('{$text}', iStu.text)
                    .replace('{$num}', count);

                $(she.el.statusbar).html(iHtml);

            }
        }///}

    };


    return player;

});

