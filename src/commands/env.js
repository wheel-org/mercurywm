function run(state, params) {
    if (params.length === 0) {
        Object.keys(state.wsh.env).forEach(e => {
            this.output(e + ': ' + state.wsh.env[e], false, false);
        });
    }
    else if (params.length === 1) {
        this.output(state.wsh.env[params[0]]);
    }
    else if (params.length === 2) {
        state.wsh.env[params[0]] = params[1];
    }
    else {
        this.output('Incorrect number of parameters');
    }
    return state;
}

export default run;
