var gulp = require("gulp"),
  gutil = require("gulp-util"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cleanCSS = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  notify = require("gulp-notify"),
  nunjucksRender = require("gulp-nunjucks-render"),
  babel = require("gulp-babel"),
  browserify = require("browserify"),
  babelify = require("babelify"),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  plumber = require("gulp-plumber");

// Сервер и автообновление страницы Browsersync
gulp.task("browser-sync", function() {
  browserSync({
    server: {
      baseDir: "app"
    },
    notify: false
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
});

gulp.task("nunjucks", function() {
  return gulp
    .src("app/njk/*.njk")
    .pipe(plumber())
    .pipe(
      nunjucksRender({
        path: ["app/njk"]
      })
    )
    .pipe(gulp.dest("app"))
    .pipe(browserSync.reload({ stream: true }));
});

// Минификация пользовательских скриптов проекта и JS библиотек в один файл
gulp.task("js", function() {
  return browserify("app/js/index.js")
    .transform("babelify", { presets: ["@babel/env"] })
    .bundle()
    .on("error", console.error.bind(console))
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(gulp.dest("app/bundle"));
});

gulp.task("sass", function() {
  return gulp
    .src("app/sass/**/*.sass")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleanCSS()) // Опционально, закомментировать при отладке
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("watch", ["sass", "js", "browser-sync", "nunjucks"], function() {
  gulp.watch("app/njk/**/*.njk", ["nunjucks"]);
  gulp.watch("app/sass/**/*.sass", ["sass"]);
  gulp.watch(["libs/**/*.js", "app/js/**/*.js"], ["js"]);
  gulp.watch("app/**/*.html", browserSync.reload);
});

gulp.task("default", ["watch"]);
