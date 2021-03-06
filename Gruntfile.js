// Generated on 2013-07-27 using generator-webapp 0.1.7
'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// execution of arbitrary node scripts
var exec = require('child_process').exec;

// API to allow cross origin https://github.com/drewzboto/grunt-connect-proxy
var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist/app',
        api: 'api',
        distApi: 'dist/api'
    };

    // Task to compile Hogan templates
    grunt.registerTask('hogan-compile', function() {
        var cmd = 'node hogan-compile.js';

        exec(cmd, function(err, stdout, stderr) {
            if (err) { throw err; }
            grunt.log.write(stdout);
        });
    });

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '{.tmp,<%= yeoman.app %>}/templates/{,*/}*.html',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    'test/spec/{,*/}*.js'
                ],
                // add manifest task as this updates timestamp in manifest file
                // which means any cached files are re-fetched from network if
                // connected
                // also add browserify so js is re-compiled on change
                // also add template compilation via Hogan
                tasks: ['livereload', 'manifest', 'browserify', 'hogan-compile']
            }
        },

        // auto generate manifest file
        manifest: {
            generate: {
                options: {
                    basePath: 'app/',
                    network: ['*'],
                    preferOnline: true,
                    verbose: true,
                    timestamp: true
                },
                src: [
                    'components/jquery/jquery.js'
                ],
                dest: 'app/manifest.appcache'
            }
        },

        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0'
            },
            proxies: [
                {
                    context: '/api',
                    host: '192.168.1.99',
                    port: 4711
                }
            ],
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'app'),
                            proxySnippet
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: 'app/components',
                relativeAssets: true
            },
            dist: { },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        // TODO: minify
        browserify: {
            dev: {
                src: ['<%= yeoman.app %>/scripts/**/*.js'],
                dest: '<%= yeoman.app %>/build/bundle.js'
            },
            test: {
                src: ['test/spec/**/*.js'],
                dest: 'test/build/bundle.js'
            },
            dist: {
                src: ['<%= yeoman.app %>/scripts/**/*.js'],
                dest: '<%= yeoman.dist %>/build/bundle.js'
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/*',
                        'build/bundle.js',
                        'build/templates/compiled.js',
                        'components/jquery/jquery.js',
                        'components/hogan.js/web/builds/2.0.0/hogan-2.0.0.js',
                        '../package.json',
                        '*.appcache',
                        '../Procfile'
                    ]
                }]
            },
            apiDist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.api %>',
                    dest: '<%= yeoman.distApi %>',
                    src: [
                        'server.js'
                    ]
                }]
            }
        },
        concurrent: {
            server: [
                'compass:server'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist'
            ]
        },
        bower: {
            options: {
                exclude: ['modernizr']
            },
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'configureProxies',
            'manifest',
            'hogan-compile',
            'browserify:dev',
            'livereload-start',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'browserify:test',
        'connect:test',
        'mocha'
    ]);

    // TODO add back in usemin and rev
    // compass:dist compiles css and puts into .tmp folder
    // cssmin takes css in .tmp, minifies and puts into dist/app/styles
    grunt.registerTask('build', [
        'clean:dist',
        'compass:dist',
        'cssmin',
        'htmlmin',
        'manifest',
        'hogan-compile',
        'browserify:dist',
        'copy:dist',
        'copy:apiDist',
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
