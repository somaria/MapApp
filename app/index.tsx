import React, { useEffect, useState } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import * as Location from 'expo-location';

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// GeoFence location (Green Bay Stadium in this case)
const GEOFENCE_LOCATION = {
   latitude: 37.78825,
   longitude: -122.4324,
  radius: 3000, // in meters
};

export default function App() {
  const mapRef = React.useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState(null);
  const [insideGeofence, setInsideGeofence] = useState(false);

  const navigation = useNavigation();

  const focusMap = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: GEOFENCE_LOCATION.latitude,
        longitude: GEOFENCE_LOCATION.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      3000
    );
  };

  // Check if user is inside the geofence
  const checkGeofence = (location: any) => {
    const distance = getDistance(
      location.coords.latitude,
      location.coords.longitude,
      GEOFENCE_LOCATION.latitude,
      GEOFENCE_LOCATION.longitude
    );
    if (distance < GEOFENCE_LOCATION.radius && !insideGeofence) {
      setInsideGeofence(true);
      Alert.alert('Entered Geofence');
    } else if (distance >= GEOFENCE_LOCATION.radius && insideGeofence) {
      setInsideGeofence(false);
      Alert.alert('Exited Geofence');
    }
  };

  // Function to calculate distance between two locations
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      checkGeofence(location);

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (location) => {
          setUserLocation(location);
          checkGeofence(location);
        }
      );

      return () => locationSubscription.remove();
    })();

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={focusMap}>
          <View>
            <Text>Focus</Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="You are here"
          />
        )}

        {/* GeoFence Circle */}
        <Circle
          center={{
            latitude: GEOFENCE_LOCATION.latitude,
            longitude: GEOFENCE_LOCATION.longitude,
          }}
          radius={GEOFENCE_LOCATION.radius}
          strokeWidth={2}
          strokeColor="red"
          fillColor="rgba(255,0,0,0.3)"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
