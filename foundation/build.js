/*
 * 项目构建运行文件
 * 
 * 命令列表如下：
 * node build -c     初始化项目文件目录、gulp构建等
 * node build -gjs     执行gulp js任务
 * node build -gcss     执行gulp css任务
 * node build -gimg     执行gulp images任务
 * node build -ghtml     执行gulp html任务
 * node build -gw         执行gulp watch任务
 */

var fs = require('fs'),
    cp = require('child_process');
var cmd = process.argv[2].toLowerCase();
switch(cmd){
    case '-c': createProj(); break;
    case '-gjs': runGulp('js'); break;
    case '-gcss': runGulp('css'); break;
    case '-gimg': runGulp('images'); break;
    case '-ghtml': runGulp('html'); break;
    case '-gw': runGulp('watch'); break;
}
function createProj(){
    cp.exec('npm link gulp', function (error, stdout, stderr) {
        console.log(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
    var _src = '../../yym-FEteam/gulpfile/gulpfile.js',
        _dest = './gulpfile.js',
        _srcPath = '../../yym-FEteam/projectInit/mobile/src',
        _destPath = './src',
        fileReadStream = fs.createReadStream(_src),
        fileWriteStream = fs.createWriteStream(_dest);
    fileReadStream.on('data',function(data){
        fileWriteStream.write(data);
    });
    fileReadStream.on('end',function(){
        console.log('gulpfile.js copied.'); 
        fileWriteStream.end();
    });
    exists(_srcPath, _destPath, copy);
}

function runGulp(taskName){
    cp.exec('gulp '+taskName, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

function copy(src, dst){
    var stat = fs.stat;
    // 读取目录中的所有文件/目录
    fs.readdir(src, function(err, paths){
        if(err){
            throw err;
        }

        paths.forEach(function(path){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;       

            stat(_src, function(err, st){
                if(err){
                    throw err;
                }
                console.log('copying '+_dst);
                // 判断是否为文件
                if(st.isFile()){
                    // 创建读取流
                    readable = fs.createReadStream(_src);
                    // 创建写入流
                    writable = fs.createWriteStream(_dst);  
                    // 通过管道来传输流
                    readable.pipe(writable);
                }
                // 如果是目录则递归调用自身
                else if(st.isDirectory()){
                    exists(_src, _dst, copy);
                }
            });
        });
    });
};

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
function exists(src, dst, callback){
    fs.exists(dst, function(exists){
        // 已存在
        if(exists){
            callback(src, dst);
        }
        // 不存在
        else{
            fs.mkdir(dst, function(){
                callback(src, dst);
            });
        }
    });
};