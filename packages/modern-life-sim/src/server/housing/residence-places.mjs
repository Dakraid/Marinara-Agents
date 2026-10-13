// Residence place ids and house check
var RESIDENCE_PLACES = ["apartments", "houses", "tower", "mansions"];
var HOUSE_PLACES = ["houses", "mansions"];
var isHousePlace = (place) => HOUSE_PLACES.includes(place);

export { RESIDENCE_PLACES, isHousePlace };
