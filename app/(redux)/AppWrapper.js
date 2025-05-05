import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Stack } from "expo-router/stack";
import { loadUser } from "./authSlice";

function AppWrapper() {
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);
  return (
    <Stack>
      <Stack.Screen name="index" 
        options={{ title: "index", headerShown: false }} />

      <Stack.Screen name="(mobile)" 
        options={{ title: "Dashboard", headerShown: false }} />

      <Stack.Screen name="authmobile/PinInput" 
        options={{ title: "PinInput", headerShown: false }} />

      <Stack.Screen name="authmobile/Blocked" 
        options={{ title: "Blocked", headerShown: false }} /> 

      <Stack.Screen name="authmobile/Login" 
        options={{ title: "Login", headerShown: false }} />

        
      <Stack.Screen name="(web)" 
        options={{ title: "Dashboard", headerShown: false }} />

      <Stack.Screen name="authweb/Login" 
        options={{ title: "Login", headerShown: false }} />

      <Stack.Screen name="authweb/Blocked" 
        options={{ title: "Blocked", headerShown: false }} />

      
    

    </Stack>
 
  );
}

export default AppWrapper;