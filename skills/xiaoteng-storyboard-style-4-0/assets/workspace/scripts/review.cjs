const {ensureService,show}=require('../outputs/分镜素材制作/4.0模板/检查/本地审片.cjs');
ensureService().then(url=>{show(url);console.log('本地审片台：'+url);}).catch(e=>{console.error(e.message);process.exitCode=1;});
