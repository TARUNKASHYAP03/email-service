class Logger {
    log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
    error(message) {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
    }
}

module.exports = Logger;