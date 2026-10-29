import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../..');
export default defineConfig({root:dir,plugins:[react(),{name:'review-identity',configureServer(server){server.middlewares.use('/__review_identity',(_req,res)=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({id:crypto.createHash('sha256').update(root).digest('hex')}));});}}],server:{host:'127.0.0.1',port:4328,fs:{allow:[root]}},build:{outDir:path.join(root,'.runtime/review-build'),emptyOutDir:true}});
