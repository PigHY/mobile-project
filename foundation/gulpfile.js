/*!
 * gulpfile.js for yym-FETeam
 *
 * @author: Rio Kwok
 */

/*
 * ======================================================================
 * To Be Updated for each project [start]
 * ======================================================================
 */
var projectName = '/topic',
    assetsDomain = '',
    assetsParentPath = '',
    assetsPath = {
        'js': '/js' + projectName,
        'jsLib': '/js/lib',
        'css': '/css' + projectName,
        'images': '/images' + projectName,
        'html': '/html' + projectName
    };
/*
 * ======================================================================
 * To Be Updated for each project [end]
 * ======================================================================
 */
var baseUrl = '../../yym-FEteam/gulp/node_modules/';
var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    sass = require(baseUrl + 'gulp-ruby-sass'), // sass compiler
    minifycss = require(baseUrl + 'gulp-minify-css'), // minify css files
    jshint = require(baseUrl + 'gulp-jshint'), // check js syntac
    uglify = require(baseUrl + 'gulp-uglify'), // uglify js files
    imagemin = require(baseUrl + 'gulp-imagemin'), // minify images
    rename = require(baseUrl + 'gulp-rename'), // rename the files
    cleanDest = require(baseUrl + 'gulp-clean-dest'), // clean out-of-date files
    concat = require(baseUrl + 'gulp-concat'), // concat the files into single file
    wrap = require(baseUrl + 'gulp-wrap'), // wrap the stream contents
    wrapAMD = require(baseUrl + 'gulp-wrap-amd'), // wrap the file with AMD wrapper
    notify = require(baseUrl + 'gulp-notify'), // notify the msg during running tasks
    handlebars = require(baseUrl + 'gulp-handlebars'), // handlebars pre-compiler
    replacePath = require(baseUrl + 'gulp-replace-path'), // replace the assets path
    requirejsOptimize = require(baseUrl + 'gulp-requirejs-optimize'), // requirejs optimizer which can combine all modules into the main js file
    filter = require(baseUrl + 'gulp-filter'), // filter the specified file(s) in file stream
    inlinesource = require('gulp-inline-source'); // requirejs optimizer which can combine all modules into the main js file


gulp.task('js', ['tmpl'], function() {
    if (!fs.existsSync('./src')) {
        process.chdir('..');
    }

    /* requirejs 主模块列表 & 页面js [start] */
    var rjsFilter = filter(['index.js']),
        pagejsFilter = filter('*.js');
    /* requirejs 主模块列表 & 页面js [end] */

    gulp.src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        /* 合并主文件中通过 requirejs 引入的模块 [start] */
        .pipe(rjsFilter)
        .pipe(requirejsOptimize({
            optimize: 'none',
            mainConfigFile: 'src/js/rConfig/rConfig.js',
        }))
        .pipe(rjsFilter.restore())
        .pipe(pagejsFilter)
        .pipe(notify({
            message: 'requirejs task complete'
        }))
        /* 合并主文件中通过 requirejs 引入的模块 [end] */
        .pipe(uglify())
        .pipe(cleanDest('dist' + assetsPath.js))
        .pipe(gulp.dest('dist' + assetsPath.js))
        .pipe(notify({
            message: 'JS task complete'
        }));
});

gulp.task('tmpl', function() {
    if (!fs.existsSync('./src')) {
        process.chdir('..');
    }

    /* Handlebars 模板引擎 [start] */
    return gulp.src('src/templates/*.hbs')
        .pipe(handlebars())
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(wrapAMD({
            deps: ['Handlebars'], // dependency array 
            params: ['Handlebars'], // params for callback
        }))
        .pipe(gulp.dest('src/js/tmpl'))
        .pipe(notify({
            message: 'Templates task complete'
        }));
    /* Handlebars 模板引擎 [end] */
});

gulp.task('css', function() {
    if (fs.existsSync('./src')) {
        process.chdir('./src');
    }

    var
        iPath = path.join(__dirname),

        iSrc = path.join(iPath, 'src'),

        imgDist = path.join(assetsPath.images),
        cssDist = path.join(assetsPath.css);
        // console.log(imgDist);
    return sass('sass/', {
            style: 'nested',
            'compass': true
        })
        .pipe(gulp.dest(path.join('css/')))
        .pipe(replacePath(
            '../images',
            path.join(imgDist).replace(/[\\]+/g, '/')

        ))
        .pipe(replacePath(
            '../../../components',
            path.join(imgDist, 'globalcomponents').replace(/[\\]+/g, '/')

        ))
        .pipe(replacePath(
            '../components',
            path.join(imgDist, 'components').replace(/[\\]+/g, '/')
        ))
        // .pipe(minifycss())
        .pipe(gulp.dest(
            path.join(
                iPath,
                'dist',
                cssDist
            )
        ))
        .pipe(notify({
            message: 'CSS task complete'
        }));
});


gulp.task('images', function() {
    if (!fs.existsSync('./src')) {
        process.chdir('..');
    }

    var iPath = path.join(__dirname),

        MOBILE_JS_FULL_SRC = path.join(iPath, 'src', 'js'),
        MOBILE_IMG_FULL_SRC = path.join(iPath, 'src', 'images'),
        MOBILE_IMG_FULL_DIST = path.join(iPath, 'dist', assetsPath.images),
        MOBILE_COMPONENTS_FULL_SRC = path.join(iPath, 'src', 'components'),
        MOBILE_GLOBAL_COMPONENTS_FULL_SRC = path.join(__dirname, '../components');

    var rConfig = require(path.join(__dirname, 'src', 'js/rConfig/rConfig.js')),
        componentsPaths = [],
        gComponentsPaths = [],
        fPath, fPoint;
    // 获取所有引入的 components 的地址
    for (var key in rConfig.paths) {
        if (rConfig.paths.hasOwnProperty(key)) {
            fPath = path.join(MOBILE_JS_FULL_SRC, path.dirname(rConfig.paths[key]));
            if (~fPath.indexOf(MOBILE_COMPONENTS_FULL_SRC)) {
                fPoint = componentsPaths;
            } else if (~fPath.indexOf(MOBILE_GLOBAL_COMPONENTS_FULL_SRC)) {
                fPoint = gComponentsPaths;
            } else {
                fPoint = undefined;
            }
            fPoint && fPoint.push(path.join(fPath, 'images/*.*'));
        }
    }
    gulp.src(componentsPaths, {
            base: MOBILE_COMPONENTS_FULL_SRC
        })
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(path.join(MOBILE_IMG_FULL_DIST, 'components')))
        .pipe(notify({
            message: 'mobile components Images task complete'
        }));

    gulp.src(gComponentsPaths, {
            base: MOBILE_GLOBAL_COMPONENTS_FULL_SRC
        })
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(path.join(MOBILE_IMG_FULL_DIST, 'globalcomponents')))
        .pipe(notify({
            message: 'mobile global components Images task complete'
        }));

    gulp.src(path.join(MOBILE_IMG_FULL_SRC, '*.*'))
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(MOBILE_IMG_FULL_DIST))
        .pipe(notify({
            message: 'MOBILE Images task complete'
        }));
});

gulp.task('html', function() {
    if (!fs.existsSync('./src')) {
        process.chdir('..');
    }
    return gulp.src('src/html/*.html')
        // line tasks
        .pipe(inlinesource())
        // 删除requirejs的配置文件引用
        .pipe(replacePath('<script type="text/javascript" src="../js/rConfig/rConfig.js" local-usage></script>', ''))
        .pipe(replacePath('../../../lib', assetsDomain + assetsParentPath + assetsPath.jsLib))
        .pipe(replacePath('../js', assetsDomain + assetsParentPath + assetsPath.js))
        .pipe(replacePath('../css', assetsDomain + assetsParentPath + assetsPath.css))
        .pipe(replacePath('../images', assetsDomain + assetsParentPath + assetsPath.images))
        .pipe(gulp.dest('dist' + assetsPath.html))
        .pipe(notify({
            message: 'HTML task complete'
        }));
});

gulp.task('watch', function() {

    // 看守所有.scss档
    gulp.watch('src/sass/**/*.scss', ['css']);

    // 看守所有.js档
    gulp.watch(['src/js/*.js', 'src/js/module/*.js'], ['js']);

    // 看守所有图片档
    gulp.watch('src/images/*.*', ['images']);

    // 看守所有图片档
    gulp.watch('src/html/*.html', ['html']);

});

gulp.task('all', ['js', 'css', 'images', 'html']);

gulp.task('watchAll', ['all', 'watch']);