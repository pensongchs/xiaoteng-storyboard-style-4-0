import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Z017} from './源码/组件';
import {ItemPreview} from '../公共/源码/预览画布';
const Preview=()=> <ItemPreview variant={13} Card={Z017}/>;
registerRoot(()=> <Composition id="Z017" component={Preview} width={1920} height={1080} fps={30} durationInFrames={135}/>);
