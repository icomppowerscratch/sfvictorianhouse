// Standalone entry: mounts the San Francisco Victorian house scene fullscreen,
// without the Instinct Files page shell.
import './style.css';
import { mountScene } from './scene';

const wrap = document.createElement('div');
wrap.className = 'scene-wrap scene-fullscreen';
document.body.appendChild(wrap);
mountScene(wrap);
