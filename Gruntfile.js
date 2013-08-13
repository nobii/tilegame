module.exports = function (grunt) {
    var config = {}, build = [];

    var path = {
        src: {
            js:   'src/js',
            sass: 'src/sass',
            ejs:  'src/ejs'
        },
        dist: {
            js:  'js',
            css: 'css',
            html:  '.',
            img: 'img'
        },
        test: 'test',
        bower: 'bower_components'
    };

    // basic
    {
        config.pkg =  grunt.file.readJSON('package.json');

        grunt.loadNpmTasks('grunt-contrib-watch');
        config.watch = {};
    }


    // js
    {
        grunt.loadNpmTasks('grunt-auto-deps');
        config.auto_deps = {
            dev: {
                scripts: ['tilegame'],
                loadPath: [path.src.js + '/*.js'],
                locate: {
                    inherits: path.bower + '/inherits/inherits.js',
                    EventEmitter: path.bower + '/EventEmitter/EventEmitter.js'
                }
            }
        };

        config.watch.js = {
            files: [path.src.js + '/*.js'],
            tasks: ['auto_deps:dev']
        };

        build.push('auto_deps:dev');
    }


    // css
    {
        grunt.loadNpmTasks('grunt-contrib-compass');

        config.compass =  {
            dev: {
                options: {
                    sassDir: path.src.sass,
                    cssDir: path.dist.css,
                    javascriptsDir: path.dist.js,
                    imagesDir: path.dist.img,
                    httpImagesPath: '../img',
                    environment: 'development'
                }
            }
        };

        config.watch.css = {
            files: [path.src.sass + '/*.scss', path.src.sass + '/**/*.scss'],
            tasks: ['compass:dev']
        };

        build.push('compass:dev');
    }


    // ejs
    {
        grunt.loadNpmTasks('grunt-simple-ejs');

        config.ejs = {
            dev: {
                template: [path.src.ejs + '/*.ejs'],
                dest: path.dist.html,
                options: 'src/options.dev.yaml'
            }
        };
        build.push('ejs:dev');

        config.watch.ejs = {
            files: [
                path.src.ejs + '/*.ejs',
                path.src.ejs + '/**/*.ejs',
                'src/options.dev.yaml'
            ],
            tasks: ['ejs:dev']
        };
    }
    // 


    // test
    {
        grunt.loadNpmTasks('grunt-mocha-html');
        grunt.loadNpmTasks('grunt-mocha-phantomjs');

        config.mocha_html =  {
            all: {
                src   : [ path.dist.js + '/tilegame.js' ],
                test  : [ path.test + '/*-test.js' ],
                assert : 'chai'
            }
        };
        build.push('mocha_html');

        config.watch.test = {
            files: [path.test + '/*-test.js'],
            tasks: ['mocha_phantomjs']
        };
        config.watch.js.tasks.push('mocha_html');

        config.mocha_phantomjs =  {
            all: [ path.test + '/*.html' ]
        };

        grunt.registerTask('test', ['mocha_phantomjs']);

    }
    // 


    // server
    {
        grunt.loadNpmTasks('grunt-koko');
        config.koko = {
            dev: {
                root: '',
                openPath: path.dist.html
            }
        };

        grunt.registerTask('server', ['koko:dev']);
    }

    // release
    {
        grunt.loadNpmTasks('grunt-release');

        config.release = {
            options: {
                file: 'bower.json',
                npm: false
            }
        };
    }

    // init
    grunt.initConfig(config);
    grunt.registerTask('build', build);
    grunt.registerTask('default', ['build']);
};