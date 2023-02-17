const logger = () => {
    const info = (message, args = null) => console.info(message, args);

    const warning = (message, args = null) => console.warn(message, args);

    const error = (message, args = null) => console.error(message, args);

    return { info, warning, error };
}

module.exports = logger;