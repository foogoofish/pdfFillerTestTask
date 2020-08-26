const { src, dest, watch } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const fs = require('fs');
const data = require('gulp-data');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const path = require('path');
var inject = require('gulp-inject');

function compilePug() {
    return src('./index.pug')
        .pipe(data( function(file) {
            return JSON.parse(
                fs.readFileSync('./static/data/tableData.json')
            );
        } ))
        .pipe(pug())
        .pipe(dest('./'));
}

function compileSass() {
    return src(['./static/styles/variables.scss', './static/styles/resets.scss', './static/styles/fonts.scss', './static/styles/base.scss', './static/styles/components/**/*.scss'])
        .pipe(concat('index.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./static/styles'));
}

function concatSVG() {
    const svgs = src('./static/images/icons/*.svg')
        .pipe(svgmin(function (file) {
            const prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return src('./includes/svg-defs.pug')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(dest('./includes'));
}

exports.default = function() {
    watch('./**/*.pug', compilePug);
    watch('./static/styles/**/*.scss', compileSass);
    watch('./static/images/icons/*.svg', concatSVG);
};



