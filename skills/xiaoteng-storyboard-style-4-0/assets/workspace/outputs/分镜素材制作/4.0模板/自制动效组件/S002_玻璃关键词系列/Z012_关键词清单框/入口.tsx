import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Z012} from './源码/组件';
import {ItemPreview} from '../公共/源码/预览画布';
const Preview=()=> <ItemPreview variant={8} Card={Z012}/>;
registerRoot(()=> <Composition id="Z012" component={Preview} width={1920} height={1080} fps={30} durationInFrames={135}/>);
