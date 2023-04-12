const earthRadiusInMeters = 6371000;

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function getDistanceInMeters(pointA, pointB) {
  const latA = toRadians(pointA.latitude);
  const lonA = toRadians(pointA.longitude);
  const latB = toRadians(pointB.latitude);
  const lonB = toRadians(pointB.longitude);

  const dlon = lonB - lonA;
  const dlat = latB - latA;

  const a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(latA) * Math.cos(latB)
    * Math.pow(Math.sin(dlon / 2), 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusInMeters * c;
}

module.exports = getDistanceInMeters;

