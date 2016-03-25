define(['util'], function(util){

    var UA = util.UA;

    var downloadApp = function() {

        var 
            cmd = 'yymobile://',
            wxUrl = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.duowan.mobile',
            appStore = 'http://itunes.apple.com/cn/app/yy-yu-le-zhen-ren-shi-pin/id427941017?mt=8',
            yyDownload = 'http://yydl.duowan.com/m/iyy872.apk',
            home = 'http://3g.yy.com/',
            now = new Date();
        if (UA.Weixin) {
            window.location.href = wxUrl;

        } else if (UA.IOS) {
            window.location.href = cmd;
            setTimeout(function() {
                if (new Date() - now < 2000) {
                    window.location.href = appStore;
                }
            }, 500);

        } else if (UA.Android) {
            if (UA.Android == '4.4' && UA.Chrome) {
                window.open(home);

            } else {
                var ifr = document.createElement("iframe");
                ifr.src = cmd;
                ifr.style.display = "none";
                document.body.appendChild(ifr);
                setTimeout(function() {
                    document.body.removeChild(ifr);
                    if (new Date() - now < 1500) {
                        window.open(yyDownload);
                    }
                }, 1000);
            }
        } else {
            window.open(home);
        }
    };

    return downloadApp;
});
