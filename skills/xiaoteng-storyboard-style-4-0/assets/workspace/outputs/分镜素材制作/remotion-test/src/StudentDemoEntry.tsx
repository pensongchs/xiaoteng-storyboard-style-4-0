import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {StudentDemo} from './StudentDemo';
registerRoot(()=> <Composition id="Student-Demo" component={StudentDemo} width={1920} height={1080} fps={30} durationInFrames={1800}/>);
