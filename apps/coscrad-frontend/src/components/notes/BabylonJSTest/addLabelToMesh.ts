import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import { AbstractMesh } from 'babylonjs';

let advancedTexture: AdvancedDynamicTexture;

function init(scene): void {
    if (!advancedTexture) {
        advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('ui1', true, scene.scene);
    }
}

export function addLabelToMesh(mesh: AbstractMesh, scene): void {
    if (!advancedTexture) {
        init(scene);
    }
    let label: Rectangle = new Rectangle('label for ' + mesh.name);
    label.background = 'black';
    label.height = '30px';
    label.alpha = 0.5;
    label.width = '100px';
    label.cornerRadius = 20;
    label.thickness = 1;
    label.linkOffsetY = 30;
    label.top = '10%';
    label.zIndex = 5;
    label.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(label);

    const text1: TextBlock = new TextBlock();
    text1.text = mesh.name;
    text1.color = 'white';
    label.addControl(text1);
}
