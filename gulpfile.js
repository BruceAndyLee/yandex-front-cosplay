const gulpSvgstore = require('gulp-svgstore');

let project_folder = "dist"; // this is where the assembled project is going to be loaded
let source_folder = "src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/assets/css/",
        js: project_folder + "/js/",
        img: project_folder + "/assets/img/",
        fonts: project_folder + "/assets/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!_" + source_folder + "/*.html"],
        css: source_folder + "/assets/styles/main.less",
        img: source_folder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico}",
        js: source_folder + "/js/script.js",
        fonts: source_folder + "/assets/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/assets/styles/**/*.less",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico}",
    },
    clean: "./" + project_folder + "/"
}

let gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    concat = require("gulp-concat"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    mediagroupper = require("gulp-group-css-media-queries"),
    csscleaner = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    svgmin = require("gulp-svgmin"),
    svgstore = require("gulp-svgstore"),
    inject = require("gulp-inject");

function browserSync() {    
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false
    })
}

function htmlWatcher() {
    return gulp.src(path.src.html)
        .pipe(fileinclude())
        .pipe(gulp.dest(path.build.html))
        .pipe(browsersync.stream());
}

function cssWatcher() {
    return gulp.src(path.src.css)
        .pipe(less())
        .pipe(concat('styles.css'))
        .pipe(mediagroupper())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(gulp.dest(path.build.css))
        .pipe(csscleaner())
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest(path.build.css))
        .pipe(browsersync.stream());
}

function watchFiles() {
    gulp.watch([path.watch.html], htmlWatcher);
    gulp.watch([path.watch.css], cssWatcher);
}

function cleanDist() {
    return del(path.clean);
}

function imgs() {
    return gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
}

function fonts() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}

function svgStore() {
    const svgs = gulp
        .src("./src/assets/img/**/*.svg")
        .pipe(
            svgmin(function () {
                return {
                    plugins: [
                        {
                            removeTitle: true,
                        },
                        {
                            removeStyleElement: true,
                        },
                    ],
                };
            })
        )
        .pipe(rename({ prefix: "icon-" }))
        .pipe(svgstore({ inlineSvg: true }));
  
    function fileContents(filePath, file) {
        return file.contents.toString();
    }
  
    return gulp
        .src("./src/index.html")
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest("./src"));
}

let build = gulp.series(cleanDist, 
                        svgStore, 
                        imgs, 
                        fonts, 
                        gulp.parallel(cssWatcher, htmlWatcher));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.css = cssWatcher;
exports.html = htmlWatcher;
exports.build = build;
exports.watch = watch;
exports.default = watch;