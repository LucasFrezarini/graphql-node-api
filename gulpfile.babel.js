import del from "del";
import gulp from "gulp";
import ts from "gulp-typescript";

const tsProject = ts.createProject("tsconfig.json");

export const clean = () => del("dist");

export const compile = () => tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest("dist"));

export const moveStatic = () => gulp
  .src(["src/**/*.json"])
  .pipe(gulp.dest("dist"));

export const build = gulp.series(clean, moveStatic, compile);

export const watch = () => gulp
  .watch(["src/**/*.ts", "src/**/*.json"], build)
  .on("error", console.error.bind(error));
  

export default build;
