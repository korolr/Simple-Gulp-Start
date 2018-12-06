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
  plumber = require("gulp-plumber"),
  htmlbeautify = require("gulp-html-beautify"),
  imagemin = require("gulp-imagemin");

// Сервер и автообновление страницы Browsersync
gulp.task("browser-sync", function() {
  browserSync({
    server: {
      baseDir: "out"
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
    .pipe(htmlbeautify())
    .pipe(gulp.dest("out"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("img", () =>
  gulp
    .src("app/img/**/*")
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest("out/img"))
);

// Минификация пользовательских скриптов проекта и JS библиотек в один файл
gulp.task("js", function() {
  return browserify("app/js/index.js")
    .transform("babelify", { presets: ["@babel/env"] })
    .bundle()
    .on("error", console.error.bind(console))
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(gulp.dest("out/bundle"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("sass", function() {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleanCSS()) // Опционально, закомментировать при отладке
    .pipe(gulp.dest("out/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task(
  "watch",
  ["sass", "js", "browser-sync", "nunjucks", "img"],
  function() {
    gulp.watch("app/njk/**/*.njk", ["nunjucks"]);
    gulp.watch("app/img/*", ["img"]);
    gulp.watch("app/scss/**/*.scss", ["sass"]);
    gulp.watch(["libs/**/*.js", "app/js/**/*.js"], ["js"]);
    gulp.watch("out/**/*.html", browserSync.reload);
  }
);

gulp.task("default", ["watch"]);
