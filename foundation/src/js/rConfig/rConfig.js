var require = {
    paths: {
        zepto: '../../../lib/zepto/yymzepto.min',
        lazyload: '../../../lib/lazyload/zepto.lazyload.min',
        FastClick:'../../../lib/fastclick/fastclick.min',
    },
    shim: {
        zepto: {
            exports: '$'
        },
        lazyload: {
            deps: ['zepto']
        }
    }
};

if (typeof module === "object" && typeof module.exports === 'object') {
    module.exports = require;
}