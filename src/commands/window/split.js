import { createWindow } from '../../constants';

function run(state, params) {
    if (params[0] === 'vs') {
        const sharedWidth = this.currWindow.width;
        this.currWindow.width = Math.floor(sharedWidth / 2);
        this.workspace.windows.push(
            createWindow(
                this.currWindow.x + this.currWindow.width,
                this.currWindow.y,
                Math.ceil(sharedWidth / 2),
                this.currWindow.height
            )
        );
    }
    else if (params[0] === 'hs') {
        const sharedHeight = this.currWindow.height;
        this.currWindow.height = Math.floor(sharedHeight / 2);
        this.workspace.windows.push(
            createWindow(
                this.currWindow.x,
                this.currWindow.y + this.currWindow.height,
                this.currWindow.width,
                Math.ceil(sharedHeight / 2)
            )
        );
    }
    return state;
}

export default run;
