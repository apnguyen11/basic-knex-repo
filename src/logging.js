function now(){
    const d = new Date();
    return d.toISOString();
}

function log(level, msg){
    console.log('[' + now() + '}' + msg)
}


function info(msg){
    log('info', msg)
}

function error(msg){
    log('error', msg)
}

module.exports = {
    // log: log,
    info: info,
    // debug: debug,
    // warn: warn,
    error: error,
    // fatal: fatal
}