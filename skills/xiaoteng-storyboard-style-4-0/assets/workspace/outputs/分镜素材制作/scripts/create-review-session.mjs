import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import {toViteFileUrl} from './vite-file-url.mjs';

const dryRun=process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter(a=>a!=='--dry-run');
const titleIndex = args.indexOf('--title');
let titleArg = titleIndex >= 0 ? args.slice(titleIndex + 1).join(' ').trim() : '';
let inputPaths = (titleIndex >= 0 ? args.slice(0, titleIndex) : args).filter(Boolean);

if (titleIndex < 0 && args.length > 1 && existsSync(resolve(args[0]))) {
  const maybeFiles = args.map((item) => existsSync(resolve(item)));
  if (!maybeFiles.slice(1).every(Boolean)) {
    inputPaths = [args[0]];
    titleArg = args.slice(1).join(' ').trim();
  }
}

if (!inputPaths.length) {
  console.error('用法: node scripts/create-review-session.mjs <视频文件路径...> --title <项目标题>');
  process.exit(1);
}

const firstSourcePath = resolve(inputPaths[0]);
const firstExt = extname(firstSourcePath) || '.mp4';
const title = titleArg || basename(firstSourcePath, firstExt);
const sessionDir = resolve('public/review-sessions');

mkdirSync(sessionDir, { recursive: true });

const videos = inputPaths.map((inputPath, index) => {
  const sourcePath = resolve(inputPath);
  const ext = extname(sourcePath) || '.mp4';
  const sourceTitle = basename(sourcePath, ext);
  if(!existsSync(sourcePath)||!statSync(sourcePath).isFile()||ext.toLowerCase()!=='.mp4')throw new Error('请提供实际存在的最终MP4：'+sourcePath);
  const fingerprint=createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  return {
    id: `video-${index + 1}`,
    title: sourceTitle,
    sourcePath,
    videoUrl: toViteFileUrl(sourcePath,fingerprint),
    scenes: [
      {
        id: 'full',
        title: '完整预览',
        start: 0,
        end: 0,
      },
    ],
  };
});

const manifest = {
  title,
  createdAt: new Date().toISOString(),
  videos,
};

if(dryRun){console.log(JSON.stringify(manifest));}else{
writeFileSync(resolve('public/review-sessions/current.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`已关联原视频审片会话: ${title}`);
console.log(`视频数量: ${videos.length}`);

}
