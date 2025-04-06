import React from 'react';
import { View } from 'react-native';
import { Camera } from 'expo-camera';

function CameraView({ onBarCodeScanned, style, children }) {
  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={style}
        onBarCodeScanned={onBarCodeScanned}
      >
        {children}
      </Camera>
    </View>
  );
}

export default CameraView;