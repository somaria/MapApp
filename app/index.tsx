import React, {useEffect} from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Alert, PermissionsAndroid, StyleSheet, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { markers } from '@/assets/markers';
import * as Location from "expo-location";

const INITIAL_REGION = {
   latitude: 37.78825,
   longitude: -122.4324,
   latitudeDelta: 0.0922,
   longitudeDelta: 0.0421,
};


export default function App() {

   const mapRef = React.useRef<MapView | null>(null);

   const navigation = useNavigation();

   const focusMap = () => {
      const GreenBayStadium = {
         latitude: 44.5013,
         longitude: -88.0622,
         latitudeDelta: 0.0922,
         longitudeDelta: 0.0421,
      }
      mapRef.current?.animateToRegion({latitude: GreenBayStadium.latitude, longitude: GreenBayStadium.longitude, latitudeDelta: GreenBayStadium.latitudeDelta, longitudeDelta: GreenBayStadium.longitudeDelta}, 3000);
   };

   const onRegionChange = (region: any) => {
      console.log(region);
   };

   const onMarkerPress = (marker: any) => {
      console.log(marker);
      Alert.alert(marker.name);
   }

   useEffect(() => {
      Location.requestForegroundPermissionsAsync();
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
			<MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE} 
         initialRegion={INITIAL_REGION} 
         showsUserLocation={true}
         showsMyLocationButton
         ref={mapRef}
         onRegionChangeComplete={onRegionChange}
         onMapReady={() => {
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ).then(granted => {
              alert(granted) // just to ensure that permissions were granted
            });
          }}
         >
            {markers.map((marker: { latitude: any; longitude: any; name: any; }, index: any) => (
               <Marker
                  key={index}
                  coordinate={marker}
                  title={marker.name}
                  onPress={() => onMarkerPress(marker)}
               />
            ))}

         </MapView>
		</View>
	);
}


