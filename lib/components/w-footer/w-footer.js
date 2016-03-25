define(['zepto', 'downloadApp', 'util'], function($, downloadApp, util){
    var options = {
        tpl: [
            '<footer class="yy-footer">',
                '<div class="yy-logo"></div>',
                '<div>',
                    '<span class="txt1">手机YY</span>',
                    '<span class="txt2">现场直播全世界</span>',
                    '<br>',
                    '<span class="txt3">精彩一起看！</span>',
                '</div>',
                '<a href="javascript:void(0)" id="yyFooterDownload">立即打开</a>',
            '</footer>' 
        ].join(''),
        onload: function(){},
        onopen: function(){}

    };


    var yyFooter = function(el, op){
        options = util.extend(options, op);
        options.eventInfo = op.eventInfo;

        $(el).append(options.tpl);
        options.onload && options.onload();

        $('#yyFooterDownload').click(function(){
            options.onopen && options.onopen();
            downloadApp();
        });
    };

    return yyFooter;
});
