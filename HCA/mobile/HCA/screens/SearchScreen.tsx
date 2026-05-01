
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../utils/api';
const NameIcon = require('../assets/NameIcon.png');
const PhotoIcon = require('../assets/PhotoIcon.png');
const { width: screenWidth } = Dimensions.get('window');
const iconButtonSize = screenWidth * 0.3;

interface PlantData {
  data: Array<{ common_name: string, id: string, scientific_name: string, family: string, genus: string, image_url: string, author: string, rank: string, status: string }>;
}

export default function SearchScreen({ navigation }: { navigation: any }) {

  const plantNetRef = React.useRef<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlantData | null>(null);
  const [plantNetResult, setPlantNetResult] = useState<any>(null);
  const [heyThatsEmptyBro, heyThatsEmptyBroMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const MAX_IMAGES = 5;
  const [searchMode, setSearchMode] = useState<'select' | 'name' | 'photo'>('select');
  const searchImageRef = React.useRef<string | null>(null);

React.useEffect(() => {
  searchImageRef.current = selectedImages[0] ?? null;
}, [selectedImages]); 

//handleflorasearch
 const handleFloraSearch = async () => {
  console.log('fires in handlefloraSearch');
    //empty fallback
    if (query.trim() === '') {
      heyThatsEmptyBroMessage('Please enter a plant name to search');
      return;
    }

  try {
    console.log('Full fetch URL:', `${API_URL}/plants/search?q=${query}`);
    const response = await fetch(`${API_URL}/plants/search?q=${query}`);

   //checks- does plantnet do anything??
    const data = await response.json();
    setResults(data);
  } catch (error) {
    console.log('Error:', error);
  }
  };


  const handlePlantNetSearch = async () => {
    console.log('handlePlantNetSearch fired')
    console.log('Images being sent:', selectedImages.length);
  try {
    const response = await fetch(`${API_URL}/plants/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: selectedImages })
    });
    console.log('Response status:', response.status);
    
    const data = await response.json();
    if (data.flora && data.flora.data.length > 0) {
      setResults(data.flora);
      plantNetRef.current = data.plantnet;
    }
    console.log('Data:', data);

  } catch (error) {
    console.log('Error:', error);
  }
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
      setSelectedImages(prev => [...prev, result.assets[0].base64!]);
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
      setSelectedImages(prev => [...prev, result.assets[0].base64!]);
      setShowPhotoModal(false);
          }
        }
      };
  //camera or library select
  const handlePhotoSearch = () => {
  setShowPhotoModal(true);
};



/* select search mode, photo or name */
return (
    <View style={styles.container}>
      {searchMode === 'select' && (

          <View style={styles.modeContainer}>
          <TouchableOpacity onPress={() => { setSearchMode('name'); setResults(null); }} style={[styles.iconButton, { width: iconButtonSize, height: iconButtonSize }]}>
            <Image source={NameIcon} style={styles.iconImage} />
      <Text style={styles.iconLabel}>Search by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSearchMode('photo'); setResults(null); setSelectedImages([]); }} style={[styles.iconButton, { width: iconButtonSize, height: iconButtonSize }]}>
            <Image source={PhotoIcon} style={styles.iconImage} />
      <Text style={styles.iconLabel}>Search by Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {searchMode === 'name' && (
        <>
        
          {/*backbutton*/}
          <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => { setSearchMode('select'); setResults(null); }}>
          <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          </View>

      <FlatList
  style={styles.resultList}
  data={results?.data || []}
  keyExtractor={(plant) => plant.id}
  renderItem={({ item: plant }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('Plant Detail', { 
  plant, 
  plantNetResult: plantNetRef.current,
  searchImage: searchImageRef.current
})}
    >
      <Text style={styles.plantName}>
        {plant.common_name || plant.scientific_name}
      </Text>
      {plant.image_url ? (
        <Image
          source={{ uri: plant.image_url }}
          style={styles.plantImage}
          resizeMode="cover"
        />
      ) : (
        <Image
  source={require('../assets/Placeholder.png')}
  style={styles.plantImage}
  resizeMode="contain"
/>
      )}
    </TouchableOpacity>
  )}
/>

      
      <TextInput
        style={[styles.searchInput, { width: screenWidth * 0.9 }]}
        value={query}
        placeholder="Search for a plant..."
        placeholderTextColor="#999"
        onChangeText={setQuery}
      />
<TouchableOpacity 
  style={[styles.searchButton, { width: screenWidth * 0.9, zIndex: 10 }]} 
  onPress={() => {
    console.log('BUTTON TAPPED');
    handleFloraSearch();
  }}
>
  <Text style={styles.searchButtonText}>Search</Text>
</TouchableOpacity>

{/*display search results in photo form*/}




      {heyThatsEmptyBro ? <Text>{heyThatsEmptyBro}</Text> : null}
      
        </>
      )}
      
      {searchMode === 'photo' && (
        <>
          {/*backbutton*/}
          <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => { setSearchMode('select'); setResults(null); }}>
          <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          </View>

<FlatList
  style={styles.resultList}
  data={results?.data || []}
  keyExtractor={(plant) => plant.id}
  renderItem={({ item: plant }) => (
    <TouchableOpacity
      style={styles.resultCard}
onPress={() => navigation.navigate('Plant Detail', { 
  plant, 
  plantNetResult: plantNetRef.current,
  searchImage: searchImageRef.current
})}
    >
      <Text style={styles.plantName}>
        {plant.common_name || plant.scientific_name}
      </Text>
      {plant.image_url ? (
        <Image
          source={{ uri: plant.image_url }}
          style={styles.plantImage}
          resizeMode="cover"
        />
      ) : (
        <Image
  source={require('../assets/Placeholder.png')}
  style={styles.plantImage}
  resizeMode="contain"
/>
      )}
    </TouchableOpacity>
  )}
/>    

      <TouchableOpacity 
  style={[styles.photoButton, { width: screenWidth * 0.9 }]} 
  onPress={handlePhotoSearch}
>
  <Text style={styles.photoButtonText}>Add Photo</Text>
</TouchableOpacity>
{selectedImages.length > 0 && (
  <Text style={styles.counterText}>
    {selectedImages.length}/{MAX_IMAGES}
  </Text>
)}
      {selectedImages.length > 0 && (
      <TouchableOpacity onPress={handlePlantNetSearch}>
      <Text>Identify Plant ({selectedImages.length})</Text>
     </TouchableOpacity>
      )}

        {/*thumbnail for camera or library input*/}
      
 {selectedImages.length > 0 && (
  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
    {selectedImages.map((uri, index) => (
      <View key={index} style={{ position: 'relative', margin: 5 }}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${uri}` }}
          style={{ width: screenWidth * 0.25, height: screenWidth * 0.25, borderRadius: 8 }}
        />
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
        >
          <Text style={styles.removeImageText}>✕</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}



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



      </>
      )}
      
      <StatusBar style="auto" />
    </View>
  );
}

//holy CSS, batman...

const GREEN = '#4a7c59';
const LIGHT_GREEN = '#d2e9c7';
const DARK_GREEN = '#2d5a3d';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingBottom: 50,
  },
  modalContainer: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  backgroundColor: 'white',
  padding: 20,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
},
modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.4)',
},
modalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 24,
  paddingBottom: 40,
},
modalTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
  textAlign: 'center',
  marginBottom: 16,
},
modalOption: {
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  alignItems: 'center',
},
modalOptionCancel: {
  borderBottomWidth: 0,
  marginTop: 8,
  backgroundColor: '#f0f0f0',
  borderRadius: 12,
},
modalOptionText: {
  fontSize: 16,
  color: DARK_GREEN,
  fontWeight: '500',
},
modeContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 30,
},
iconButton: {
  backgroundColor: GREEN,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},
iconImage: {
  width: '70%',
  height: '70%',
  resizeMode: 'contain',
  borderRadius: 12,
},
iconLabel: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: '600',
  color: '#eee',
  textAlign: 'center',
},
photoButton: {
  backgroundColor: GREEN,
  marginVertical: 8,
  paddingVertical: 14,
  borderRadius: 30,
  alignItems: 'center',
  alignSelf: 'center',
},
photoButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},
searchInput: {
  backgroundColor: '#fff',
  marginBottom: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 30,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#ddd',
  alignSelf: 'center',
},
searchButton: {
  backgroundColor: GREEN,
  marginBottom: 16,
  paddingVertical: 14,
  borderRadius: 30,
  alignItems: 'center',
  alignSelf: 'center',
},
searchButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},
modeWrapper: {
  flex: 1,
  width: '100%', 
},
bottomContainer: {
  paddingVertical: 16,
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#eee',
  backgroundColor: LIGHT_GREEN,
  width: '100%',   
},
resultList: {
  flex: 1,
  width: '100%',
},
resultCard: {
  padding: 10,
  backgroundColor: '#fff',
  marginVertical: 4,
  borderRadius: 8,
},
plantName: {
  fontSize: 16,
  fontWeight: '600',
  color: DARK_GREEN,
},
plantImage: {
  width: '100%',
  height: 200,
  borderRadius: 8,
  marginTop: 8,
},
imagePlaceholder: {
  width: '100%',
  height: 200,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'center',
},
placeholderText: {
  color: '#666',
  fontSize: 14,
},
backButtonContainer: {
  position: 'absolute',
  top: 10,
  left: 10,
  zIndex: 100,
},
backButtonText: {
  color: DARK_GREEN,
  fontSize: 16,
  fontWeight: '600',
},
counterText: {
  color: DARK_GREEN,
  fontWeight: '600',
  fontSize: 14,
  marginBottom: 12,
  textAlign: 'center',
},
removeImageButton: {
  position: 'absolute',
  top: -6,
  right: -6,
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: DARK_GREEN,
  justifyContent: 'center',
  alignItems: 'center',
},
removeImageText: {
  color: DARK_GREEN,
  fontWeight: '700',
  fontSize: 12,
  lineHeight: 14,
},
});
