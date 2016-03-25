define(['zepto'], function($){
    var options = {
        tpl: [
            '<div class="share-loading" id="pageLoading">',
                '<span class="share-loading-item">',
                    '<i class="share-loading-item-s1"></i>',
                    '<i class="share-loading-item-s2"></i>',
                    '<i class="share-loading-item-s3">',
                        '<i class="share-loading-item-s3-1"></i>',
                        '<i class="share-loading-item-s3-2"></i>',
                    '</i>',
                '</span>',
            '</div>'
        ].join('')
    };
    var loading = {
        el: undefined,
        show: function(){
            var she = this;
            she.el = $('#pageLoading')[0];
            if(!she.el){
                $(document.body).append(options.tpl);
                she.el = $('#pageLoading')[0];
            }

            $(she.el).addClass('share-loading-show');

        },

        hide: function(){
            var she = this;
            clearTimeout(she.timeoutKey);
            she.el = $('#pageLoading')[0];
            she.el && $(she.el).removeClass('share-loading-show');
            $(she.el).remove();
            she.show = function(){};
        }
    };

    window.onunload = function(){
        document.body.style.display = "none";
    };
    return loading;

});
