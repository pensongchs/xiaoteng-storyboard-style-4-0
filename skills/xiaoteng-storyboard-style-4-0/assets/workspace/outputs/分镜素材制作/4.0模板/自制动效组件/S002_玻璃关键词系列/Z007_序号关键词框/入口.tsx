import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Z007} from './源码/组件';
import {ItemPreview} from '../公共/源码/预览画布';
const Preview=()=> <ItemPreview variant={3} Card={Z007}/>;
registerRoot(()=> <Composition id="Z007" component={Preview} width={1920} height={1080} fps={30} durationInFrames={135}/>);
