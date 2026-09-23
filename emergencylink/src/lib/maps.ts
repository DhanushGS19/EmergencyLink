export const calculateRoute = async (
  origin: { lat: number, lng: number }, 
  destination: { lat: number, lng: number }
) => {
  if (!window.google) throw new Error("Google Maps not loaded");

  const directionsService = new window.google.maps.DirectionsService();

  try {
    const results = await directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      },
      provideRouteAlternatives: true
    });

    const route = results.routes[0];
    const leg = route.legs[0];

    return {
      directions: results,
      distance: leg.distance?.text,
      duration: leg.duration?.text,
      durationInTraffic: leg.duration_in_traffic?.text,
    };
  } catch (error) {
    console.error("Error calculating route:", error);
    return null;
  }
};
