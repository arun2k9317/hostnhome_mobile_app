import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { VendorStackParamList } from "./types";
import { VendorTabNavigator } from "./VendorTabNavigator";
import { SettingsScreen } from "../screens/vendor/SettingsScreen";
import { ResortDetailScreen } from "../screens/vendor/ResortDetailScreen";
import { CreateResortScreen } from "../screens/vendor/CreateResortScreen";
import { CreateRoomScreen } from "../screens/vendor/CreateRoomScreen";
import { BookingDetailScreen } from "../screens/vendor/BookingDetailScreen";
import { QuotationDetailScreen } from "../screens/vendor/QuotationDetailScreen";
import { CreateQuotationScreen } from "../screens/vendor/CreateQuotationScreen";

const Stack = createStackNavigator<VendorStackParamList>();

export function VendorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={VendorTabNavigator} />
      {/* Additional stack screens for details, forms, etc. */}
      <Stack.Screen
        name="Rooms"
        component={ResortDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateResort"
        component={CreateResortScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuotationDetails"
        component={QuotationDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateQuotation"
        component={CreateQuotationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: "Settings" }}
      />
    </Stack.Navigator>
  );
}
