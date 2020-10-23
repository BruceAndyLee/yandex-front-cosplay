
let project_folder = "dist"; // this is where the assembled project is going to be loaded
let source_folder = "src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!_" + source_folder + "/*.html"],
        css: source_folder + "/less/styles.less",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/less/**/*.less",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    mediagroupper = require("gulp-group-css-media-queries"),
    csscleaner = require("gulp-clean-css"),
    rename = require("gulp-rename");

function browserSync() {
    browsersync.init({ // takes in some plugin configurations
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false
    })
}

function htmlWatcher() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function cssWatcher() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(mediagroupper())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(csscleaner())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}


function watchFiles() {
    gulp.watch([path.watch.html], htmlWatcher);
    gulp.watch([path.watch.css], cssWatcher);
}

function cleanDist() {
    return del(path.clean);
}

let build = gulp.series(cleanDist, gulp.parallel(cssWatcher, htmlWatcher));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.css = cssWatcher;
exports.html = htmlWatcher;
exports.build = build;
exports.watch = watch;
exports.default = watch;
