function getTimeStringFromDouble(t) {
    return ((t < 10) ? '0' + parseInt(t) : parseInt(t).toString())
        + ((t % 1 === 0) ? ':00' : ':30');
}

try {
    exports.getTimeStringFromDouble = getTimeStringFromDouble
} catch (error) {
}