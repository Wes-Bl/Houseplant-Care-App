import type { RouteProp } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { API_URL } from '../utils/api';


export default function PlantDetailScreen({ route }: { route: RouteProp<any, any> }) {
  const { plant, plantNetResult, searchImage } = route.params || {};
  console.log('plantNetResult:', plantNetResult);
console.log('bestMatch:', plantNetResult?.bestMatch);
  const scientificName = plantNetResult 
  ? plantNetResult.bestMatch.split(' ').slice(0, 2).join(' '): plant.scientific_name;
  console.log(plantNetResult);
  const [perenualData, setPerenualData] = useState<any>(null);

useEffect(() => {
  console.log('scientificName:', scientificName);
  console.log('API_URL:', API_URL);
  console.log('Full URL:', `${API_URL}/plants/details?scientific_name=${encodeURIComponent(scientificName)}`);
  
  if (scientificName) {
    fetch(`${API_URL}/plants/details?scientific_name=${encodeURIComponent(scientificName)}`)
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Perenual data received:', JSON.stringify(data));
        setPerenualData(data);
      })
      .catch(err => console.log('Perenual error:', err));
  } else {
    console.log('scientificName is falsy, skipping fetch');
  }
}, [scientificName]);
//add to my plants...
const handleAddToMyPlants = () => {
  console.log('searchImage length:', searchImage?.length);
  console.log('searchImage exists?', !!searchImage);
  const db = SQLite.openDatabaseSync('myplants.db');
  const info = perenualData ? JSON.stringify({
  watering: perenualData.watering,
  sunlight: perenualData.sunlight,
  cycle: perenualData.cycle,
  indoor: perenualData.indoor,
  poisonous_to_humans: perenualData.poisonous_to_humans,
  poisonous_to_pets: perenualData.poisonous_to_pets,
  description: perenualData.description,
  scientific_name: scientificName,
  family: plant.family,
  genus: plant.genus,
}) : '';
console.log('info being saved:', info.substring(0, 100));
  db.runSync(
    'INSERT INTO plants (name, photo, info) VALUES (?, ?, ?)',
    [
      plant.common_name || plant.scientific_name,
      searchImage  || '',
      info
    ]
  );
  alert('Plant added to My Plants!');
};


  return (
    <ScrollView style={styles.container}>
        <Image source={{ uri: plant.image_url }} style={{ width: 200, height: 200 }} />
        <Text>Common Name: {plant.common_name}</Text>
        <Text>Scientific Name: {scientificName}</Text>
        <Text>Family: {plant.family}</Text>
        <Text>Genus: {plant.genus}</Text>       

    {perenualData ? (
  <>
    <Text>Watering: {perenualData.watering}</Text>
    <Text>Sunlight: {perenualData.sunlight?.join(', ')}</Text>
    <Text>Cycle: {perenualData.cycle}</Text>
    <Text>Indoor: {perenualData.indoor ? 'Yes' : 'No'}</Text>
    <Text>Poisonous to humans: {perenualData.poisonous_to_humans ? 'Yes' : 'No'}</Text>
    <Text>Poisonous to pets: {perenualData.poisonous_to_pets ? 'Yes' : 'No'}</Text>
    {perenualData.description ? <Text>{perenualData.description}</Text> : null}
    </>
    ) : (
  <Text>No care information available for this plant.</Text>
    )}
    <TouchableOpacity
  onPress={handleAddToMyPlants}
  style={{ backgroundColor: '#4a7c59', padding: 14, borderRadius: 30, margin: 16, alignItems: 'center' }}
>
  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Add to My Plants</Text>
</TouchableOpacity>



    </ScrollView>
  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2e9c7',
  },
});




