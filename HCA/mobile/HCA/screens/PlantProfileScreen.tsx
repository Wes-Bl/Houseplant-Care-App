import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function PlantProfileScreen({ route, navigation }: { route: any, navigation: any }) {
  const { plant } = route.params;
  const db = SQLite.openDatabaseSync('myplants.db');
  const [currentPlant, setCurrentPlant] = useState(plant);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(plant.name);
  const [editedInfo, setEditedInfo] = useState(plant.info || '');
  
React.useEffect(() => {
  const fresh = db.getFirstSync('SELECT * FROM plants WHERE id = ?', [plant.id]) as any;
  console.log('fresh id:', fresh?.id);
  console.log('fresh name:', fresh?.name);
  console.log('fresh info first char:', fresh?.info?.[0]);
  console.log('fresh info length:', fresh?.info?.length);
  if (fresh) setCurrentPlant(fresh);
}, []);
  
const getImageUri = (photo: string) => {
  if (photo.startsWith('http')) return photo;
  if (photo.startsWith('/9j/')) return `data:image/jpeg;base64,${photo}`;
  return `data:image/png;base64,${photo}`;
};


const handleChangePhoto = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.granted) {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled) {
      const newPhoto = result.assets[0].base64!;
      db.runSync('UPDATE plants SET photo = ? WHERE id = ?', [newPhoto, plant.id]);
      setCurrentPlant((prev: any) => ({ ...prev, photo: newPhoto }));
    }
  }
};

  const savePlant = () => {
    db.runSync('UPDATE plants SET name = ?, info = ? WHERE id = ?', [editedName, editedInfo, plant.id]);
    setEditMode(false);
    navigation.goBack();
  };

  const deletePlant = () => {
    db.runSync('DELETE FROM plants WHERE id = ?', [plant.id]);
    navigation.goBack();
  };

  
  return (
<ScrollView style={styles.container}>
      {currentPlant.photo ? (
        <Image
          source={{ uri: getImageUri(currentPlant.photo) }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => console.log('Image error:', e.nativeEvent.error)}
        />
      ) : null}

<TouchableOpacity
  onPress={handleChangePhoto}
  style={{ alignSelf: 'center', marginVertical: 8 }}
>
  <Text style={{ color: '#4a7c59', fontWeight: '600' }}>
    {currentPlant.photo ? 'Change Photo' : 'Add Photo'}
  </Text>
</TouchableOpacity>

      {editMode ? (
      <>
        <TextInput style={styles.input} value={editedName} onChangeText={setEditedName} />
        <TextInput style={styles.input} value={editedInfo} onChangeText={setEditedInfo} multiline />
        <TouchableOpacity onPress={savePlant}><Text>Save</Text></TouchableOpacity>
        <TouchableOpacity onPress={deletePlant}><Text>Delete</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setEditMode(false)}><Text>Cancel</Text></TouchableOpacity>

        
      </>
    ) : (
      <>
      
      <Text style={styles.name}>{currentPlant.name}</Text>
      {currentPlant.info ? (() => {
  try {
    const data = JSON.parse(currentPlant.info);
    return (
      <>
        {data.scientific_name ? <Text style={styles.info}>Scientific Name: {data.scientific_name}</Text> : null}
        {data.family ? <Text style={styles.info}>Family: {data.family}</Text> : null}
        {data.genus ? <Text style={styles.info}>Genus: {data.genus}</Text> : null}
        {data.watering ? <Text style={styles.info}>Watering: {data.watering}</Text> : null}
        {data.sunlight ? <Text style={styles.info}>Sunlight: {Array.isArray(data.sunlight) ? data.sunlight.join(', ') : data.sunlight}</Text> : null}
        {data.cycle ? <Text style={styles.info}>Cycle: {data.cycle}</Text> : null}
        {data.indoor !== undefined ? <Text style={styles.info}>Indoor: {data.indoor ? 'Yes' : 'No'}</Text> : null}
        {data.poisonous_to_humans !== undefined ? <Text style={styles.info}>Poisonous to humans: {data.poisonous_to_humans ? 'Yes' : 'No'}</Text> : null}
        {data.poisonous_to_pets !== undefined ? <Text style={styles.info}>Poisonous to pets: {data.poisonous_to_pets ? 'Yes' : 'No'}</Text> : null}
        {data.description ? <Text style={styles.info}>{data.description}</Text> : null}
      </>
    );
  } catch {
    return <Text style={styles.info}>{currentPlant.info}</Text>;
  }
})() : null}
      
      <TouchableOpacity onPress={() => setEditMode(true)}>
        <Text>Edit</Text>
      </TouchableOpacity>
        </>
    )}
    </ScrollView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2e9c7',
  },
  photo: {
    width: '100%',
    height: 250,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5a3d',
    padding: 16,
  },
  info: {
    fontSize: 15,
    color: '#444',
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 16,
  },
});