import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MyPlantsScreen({ navigation }: { navigation: any }) {
    const [newPlantName, setNewPlantName] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [plantPhoto, setPlantPhoto] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPlantInfo, setNewPlantInfo] = useState('');
    const [plants, setPlants] = useState<any[]>([]);
    const db = SQLite.openDatabaseSync('myplants.db');
    
    
    const loadPlants = () => {
    const result = db.getAllSync('SELECT * FROM plants');
    setPlants(result as any);

    };
    {/*adds new plant to database*/}
        const addPlant = () => {
        if (newPlantName.trim() === '') return;
        db.runSync(
            'INSERT INTO plants (name, photo, info) VALUES (?, ?, ?)',
            [newPlantName.trim(), plantPhoto, newPlantInfo.trim()]
        );
        setNewPlantName('');
        setNewPlantInfo('');
        setPlantPhoto('');
        setShowAddModal(false);
        loadPlants();
        };


    //camera input from user to go to pl@nt
        //permission is the "allow device to use photos etc" popup
    const handleCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({ 
      base64: true,
      quality: 0.5,
      allowsEditing: true,
    });
        if (!result.canceled) {
          setPlantPhoto(result.assets[0].base64!);
          setShowPhotoModal(false);
        }
      }
    };
    
      const handleLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted) {
          const result = await ImagePicker.launchImageLibraryAsync({ 
      base64: true,
      quality: 0.5,
      allowsEditing: true,
    });
        if (!result.canceled) {
          setPlantPhoto(result.assets[0].base64!);
          setShowPhotoModal(false);
              }
            }
          };
      //camera or library select
      const handlePhotoSearch = () => {
      setShowPhotoModal(true);
    };
    
  //user's plants database


    useEffect(() => {
    db.execSync(`CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        photo TEXT,
        info TEXT
    )`);
    try {
    db.execSync(`ALTER TABLE plants ADD COLUMN info TEXT`);
} catch (e) {
    // column already exists
    }
    loadPlants();
    }, []);
    useFocusEffect(
  React.useCallback(() => {
    loadPlants();
  }, [])
);

    
    return (
    <View style={styles.container}>
    

        <FlatList
            data={plants}
            keyExtractor={(plant) => plant.id.toString()}
            style={{ width: '100%', flex: 1 }} 
            renderItem={({ item: plant }) => (
                      <TouchableOpacity onPress={() => navigation.navigate('Plant Profile', { plant })}>
            <View style={styles.plantCard}>
    {plant.photo ? (
  <Image 
    source={{ uri: plant.photo.startsWith('http') 
      ? plant.photo 
      : `data:image/jpeg;base64,${plant.photo}` 
    }} 
    style={styles.plantImage} 
  />
    ) : (
      <View style={styles.plantImagePlaceholder}>
        <Image source={require('../assets/Placeholder.png')} style={styles.plantImage} />
      </View>
    )}
    <View style={styles.plantInfo}>
      <Text style={styles.plantName}>{plant.name}</Text>
      {plant.info ? (() => {
  try {
    const data = JSON.parse(plant.info);
    return <Text style={styles.plantInfoText} numberOfLines={1}>{["Watering: " + data.watering, "Sunlight: " + data.sunlight?.[0]].filter(Boolean).join(' · ')}</Text>;
  } catch {
    return <Text style={styles.plantInfoText} numberOfLines={2}>{plant.info}</Text>;
  }
})() : null}
    </View>
  </View>
  </TouchableOpacity>
)}
/>

<TouchableOpacity
        style={styles.addButton}
        onPress={() => {
        console.log('button pressed');
        setShowAddModal(true);}}>
        <Text style={styles.addButtonText}>+ Add Plant</Text>
</TouchableOpacity>


        <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
  <ScrollView contentContainerStyle={styles.addModalContent}>
    <Text style={styles.modalTitle}>New Plant</Text>

    {/* Photo picker tap target with preview */}
    <TouchableOpacity style={styles.photoPickerBox} onPress={() => setShowPhotoModal(true)}>
      {plantPhoto ? (
        <Image source={{ uri: `data:image/jpeg;base64,${plantPhoto}` }} style={styles.photoPreview} />
      ) : (
        <>
          <Text style={styles.photoPickerIcon}>📷</Text>
          <Text style={styles.photoPickerLabel}>Tap to add a photo</Text>
        </>
      )}
    </TouchableOpacity>

    {/* Name input */}
    <Text style={styles.fieldLabel}>Plant Name</Text>
    <TextInput style={styles.input} value={newPlantName} placeholder="e.g. Monstera Deliciosa" onChangeText={setNewPlantName} />

    {/* Info input */}
    <Text style={styles.fieldLabel}>Information / Notes</Text>
    <TextInput
      style={[styles.input, styles.inputMultiline]}
      value={newPlantInfo}
      placeholder="Watering schedule, sunlight needs, fun facts…"
      onChangeText={setNewPlantInfo}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
    />

    <TouchableOpacity style={styles.saveButton} onPress={addPlant}>
      <Text style={styles.saveButtonText}>Save Plant</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.cancelButton} onPress={() => {
      setNewPlantName(''); setNewPlantInfo(''); setPlantPhoto('');
      setShowAddModal(false);
    }}>
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>


  {/*modal popup*/}
              <Modal visible={showPhotoModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                  <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => { setTimeout(handleCamera, 500); }} >
                    <Text>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => { setTimeout(handleLibrary, 500); }}>
                    <Text>Photo Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => setShowPhotoModal(false)}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>


  </ScrollView>
</Modal>
    




    </View>
    
    );
}
const GREEN = '#4a7c59';
const LIGHT_GREEN = '#d2e9c7';
const DARK_GREEN = '#2d5a3d';

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#d2e9c7',
    alignItems: 'stretch',
    },
    modalContainer: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: LIGHT_GREEN,
    },
//ihatecss i hate css//
 
  /* Header */
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: GREEN,
    marginBottom: 16,
  },
 
  /* Plant List */
  list: {
    flex: 1,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  plantImage: {
    width: 80,
    height: 80,
  },
  plantImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantImagePlaceholderText: {
    fontSize: 32,
  },
  plantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  plantInfoText: {
    fontSize: 13,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: GREEN,
    marginTop: 40,
    fontSize: 15,
  },
 
  /* Add Button */
  addButton: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
 
  /* add modal */
  addModalContent: {
    backgroundColor: 'white',
    padding: 24,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 24,
  },
  photoPickerBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 2,
    borderColor: GREEN,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPickerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoPickerLabel: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  },
  inputMultiline: {
    height: 110,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
 
  /* Photo Source Modal */
  photoModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  photoModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  photoModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  photoOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  photoOptionCancel: {
    borderBottomWidth: 0,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  photoOptionText: {
    fontSize: 16,
    color: DARK_GREEN,
    fontWeight: '500',
  },
});