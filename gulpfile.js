const gulp = require('gulp');
let iconfont = require('gulp-iconfont');
let iconfontCss = require('gulp-iconfont-css');

let fontName = 'idlecon';

gulp.task('icons', async function(){
    gulp.src(['./assets/icons/svg/*.svg'])
        .pipe(iconfontCss({
            fontName: fontName,
            path: './assets/icons/template.scss',
            targetPath: '/pufficon.scss',
            fontPath: '/',
            cssClass : 'pufficon'
        }))
        .pipe(iconfont({
            fontName: fontName,
            fontHeight: 1000,
            normalize: true
        }))
        .pipe(gulp.dest('./client/assets/icons'));
});