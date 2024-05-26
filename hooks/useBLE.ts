import { useState, useEffect, useCallback } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import base64 from 'react-native-base64';
import SyncStorage from 'sync-storage';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const TANK_STATUS_UUID = '1dcef519-43ec-4267-8d4a-3b02ca61765d';
const RED_UUID = '8a7f1168-48af-4ef4-9bae-a8d15f08cefe';
const GREEN_UUID = '77b9c657-94d5-4f72-bfd4-53758dffa508';
const BLUE_UUID = '0dcef519-43ec-4267-8d4a-3b02ca61765d';

const manager = new BleManager();

export const useBLE = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [noDevicesFound, setNoDevicesFound] = useState(false);
  const [tank1Status, setTank1Status] = useState<number | null>(null);
  const [tank2Status, setTank2Status] = useState<number | null>(null);
  const [tank3Status, setTank3Status] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (manager) {
        manager.stopDeviceScan();
        manager.destroy();
      }
    };
  }, []);

  const scanAndConnect = useCallback(async () => {
    if (isScanning) return;
  
    setIsScanning(true);
    setNoDevicesFound(false);
    setIsConnected(false);
    setConnectedDevice(null);
  
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        setIsScanning(false);
        return;
      }
    }
  
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setIsScanning(false);
        return;
      }
  
      if (device && device.name === 'ColorControl') {
        manager.stopDeviceScan();
        setIsScanning(false);
        device.connect()
          .then((device) => {
            setIsConnected(true);
            setConnectedDevice(device);
            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            setupNotifications(device);
            // Assuming `loadRecipes` is available via context or props
            loadRecipes(); // Ensure recipes are loaded as soon as the device is connected
          })
          .catch(() => {
            setIsConnected(false);
            setConnectedDevice(null);
          });
      }
    });
  
    setTimeout(() => {
      if (!isConnected && !connectedDevice) {
        manager.stopDeviceScan();
        setIsScanning(false);
        setNoDevicesFound(true);
      }
    }, 10000);
  }, [isScanning, isConnected, connectedDevice]);

  const setupNotifications = useCallback((device: Device) => {
    monitorCharacteristic(device, SERVICE_UUID, TANK_STATUS_UUID, 'Tank Status', (value) => {
      const tank1 = parseInt(value.substring(0, 2), 16);
      const tank2 = parseInt(value.substring(2, 4), 16);
      const tank3 = parseInt(value.substring(4, 6), 16);
      setTank1Status(tank1);
      setTank2Status(tank2);
      setTank3Status(tank3);
    });
  }, []);

  const monitorCharacteristic = useCallback((device: Device, serviceUUID: string, characteristicUUID: string, characteristicName: string, setState: (value: string) => void) => {
    device.monitorCharacteristicForService(serviceUUID, characteristicUUID, (error, characteristic) => {
      if (error) return;
      if (characteristic?.value) {
        const decodedValue = base64.decode(characteristic.value);
        setState(decodedValue);
      }
    });
  }, []);

  const loadRecipes = () => {
    console.log('Loading recipes...');
    const storedRecipes = SyncStorage.get('recipes');
    if (storedRecipes) {
      const parsedRecipes = JSON.parse(storedRecipes);
      console.log('Recipes loaded:', parsedRecipes);
      return parsedRecipes; // Return the parsed recipes
    } else {
      console.log('No recipes found');
      return []; // Return an empty array if no recipes are found
    }
  };
  

  const sendData = useCallback(async (selectedRecipe) => {
    if (connectedDevice && isConnected) {
      try {
        const redData = base64.encode(String(selectedRecipe.red));
        const greenData = base64.encode(String(selectedRecipe.green));
        const blueData = base64.encode(String(selectedRecipe.blue));

        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, RED_UUID, redData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, GREEN_UUID, greenData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, BLUE_UUID, blueData);
      } catch (error) {}
    }
  }, [connectedDevice, isConnected]);

  return {
    isConnected,
    isScanning,
    noDevicesFound,
    tank1Status,
    tank2Status,
    tank3Status,
    scanAndConnect,
    sendData,
    connectedDevice,
  };
};
