(function(){
    /* 微信分享函数 [start] */
    function weixinShare(options){
        if(!wx){
            return;
        }

        wx.ready(function(){
            var shareObj = {
                title: options.title,
                link: options.link,
                imgUrl: options.imgUrl,
                desc: options.desc,
                trigger: function() {},
                success: function() {},
                cancel: function() {},
                fail: function() {}
            };
            wx.onMenuShareTimeline({
                title: options.desc,
                link: options.link,
                imgUrl: options.imgUrl,
                trigger: function() {},
                success: function() {},
                cancel: function() {},
                fail: function() {}
            });
            wx.onMenuShareAppMessage(shareObj);
            wx.onMenuShareQQ(shareObj);
            wx.onMenuShareWeibo(shareObj);
            wx.onMenuShareQZone(shareObj);
        });
    }
    /* 微信分享函数 [end] */

    /* 手机YY分享函数 [start] */
    function yyShare(options){
        var BarButtonItemIdentifiers = {
            "SHARE" : 1
        };
        Y1931Overridable.onNavigationBarButtonItemTapped = function(identifier) {
            switch (identifier) {
                case BarButtonItemIdentifiers.SHARE: {
                    window.YYApiCore.invokeClientMethod('ui','share',{
                        title: options.title,
                        shareUrl: options.shareUrl,
                        imageUrl: options.imgUrl,
                        content: options.content,
                        musicUrl: "",
                        videoUrl: ""
                    },function(res){
                    });
                }
                default: {
                    break;
                }
            }
        };

        var shareButton = Y1931API.createBarButtonItem(BarButtonItemIdentifiers.SHARE, "分享", Y1931BarButtonItemIcons.SHARE);
        Y1931Overridable.onGetNavigationBarInformation = function() {
            return Y1931API.createNavigationBarInformation(options.title, 0, [shareButton]); 
        };
    }
    /* 手机YY分享函数 [end] */

    var shareAPI = {
        weixin: weixinShare,
        yy: yyShare,
    };

    window.shareAPI = shareAPI;
})();
