// utils/simplifyPath.js

const getPerpendicularDistance = (point, lineStart, lineEnd) => {
    const area = Math.abs(0.5 * (lineStart.latitude * lineEnd.longitude + lineEnd.latitude * point.longitude +
        point.latitude * lineStart.longitude - lineEnd.latitude * lineStart.longitude - point.latitude * lineEnd.longitude - lineStart.latitude * point.longitude));
    const bottom = Math.sqrt(Math.pow(lineStart.latitude - lineEnd.latitude, 2) + Math.pow(lineStart.longitude - lineEnd.longitude, 2));
    const height = area / bottom * 2;
    return height;
};

const douglasPeucker = (points, tolerance) => {
    if (points.length <= 2) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    let index = -1;
    let maxDistance = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const distance = getPerpendicularDistance(points[i], firstPoint, lastPoint);
        if (distance > maxDistance) {
            index = i;
            maxDistance = distance;
        }
    }

    if (maxDistance > tolerance) {
        const leftSegment = points.slice(0, index + 1);
        const rightSegment = points.slice(index);
        const simplifiedLeft = douglasPeucker(leftSegment, tolerance);
        const simplifiedRight = douglasPeucker(rightSegment, tolerance);
        return simplifiedLeft.slice(0, simplifiedLeft.length - 1).concat(simplifiedRight);
    } else {
        return [firstPoint, lastPoint];
    }
};

exports.simplifyPath = (points, tolerance) => {
    return douglasPeucker(points, tolerance);
};
