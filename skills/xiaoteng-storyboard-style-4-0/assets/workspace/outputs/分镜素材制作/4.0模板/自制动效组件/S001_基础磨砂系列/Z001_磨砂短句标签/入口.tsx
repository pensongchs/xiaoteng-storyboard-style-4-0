import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Preview} from './源码/预览';
registerRoot(()=> <Composition id="Z001" component={Preview} durationInFrames={150} fps={30} width={1920} height={1080}/>);
