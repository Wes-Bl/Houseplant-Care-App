import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

//screens
import MyPlantsScreen from './screens/MyPlantsScreen';
import PlantDetailScreen from './screens/PlantDetailScreen';
import PlantProfileScreen from './screens/PlantProfileScreen';
import SearchScreen from './screens/SearchScreen';

console.log(PlantProfileScreen);
const Tab = createBottomTabNavigator();
const SearchStack = createNativeStackNavigator();
const MyPlantsStack = createNativeStackNavigator();

 /*  App Navigation  */


function SearchStackScreen() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search for Plants" component={SearchScreen} />
      <SearchStack.Screen name="Plant Detail" component={PlantDetailScreen} />
    </SearchStack.Navigator>
  );
}

function MyPlantsStackScreen() {
  return (
    <MyPlantsStack.Navigator>
      <MyPlantsStack.Screen name="My Plants List" component={MyPlantsScreen} />
      <MyPlantsStack.Screen name="Plant Profile" component={PlantProfileScreen} />
    </MyPlantsStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="My Plants" component={MyPlantsStackScreen} />
        <Tab.Screen name="Search" component={SearchStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
