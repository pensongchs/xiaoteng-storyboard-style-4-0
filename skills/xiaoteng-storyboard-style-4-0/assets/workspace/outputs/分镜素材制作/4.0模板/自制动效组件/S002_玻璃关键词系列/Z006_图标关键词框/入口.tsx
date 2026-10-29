import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Z006} from './源码/组件';
import {ItemPreview} from '../公共/源码/预览画布';
const Preview=()=> <ItemPreview variant={2} Card={Z006}/>;
registerRoot(()=> <Composition id="Z006" component={Preview} width={1920} height={1080} fps={30} durationInFrames={135}/>);
