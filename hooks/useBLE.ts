// hooks/useBLE.ts

import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const TANK_STATUS_UUID = '1dcef519-43ec-4267-8d4a-3b02ca61765d';
const RED_UUID = '8a7f1168-48af-4ef4-9bae-a8d15f08cefe';
const GREEN_UUID = '77b9c657-94d5-4f72-bfd4-53758dffa508';
const BLUE_UUID = '0dcef519-43ec-4267-8d4a-3b02ca61765d';

const manager = new BleManager();

export function useBLE() {
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

  async function scanAndConnect() {
    if (isScanning) return;

    console.log('Starting scan...');
    setIsScanning(true);
    setNoDevicesFound(false);
    setIsConnected(false);
    setConnectedDevice(null);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission BLE refusée');
        setIsScanning(false);
        return;
      }
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Erreur de scan :', error);
        setIsScanning(false);
        return;
      }

      console.log('Scanning...');

      if (device && device.name === 'ColorControl') {
        console.log('Appareil trouvé :', device.name);
        manager.stopDeviceScan();
        setIsScanning(false);
        device.connect()
          .then((device) => {
            console.log('Connecté à :', device.name);
            setIsConnected(true);
            setConnectedDevice(device);
            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            console.log('Services et caractéristiques découverts');
            setupNotifications(device);
          })
          .catch(err => {
            console.log('Erreur de connexion ou de découverte :', err);
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
        console.log('Scan arrêté, aucun appareil connecté.');
      }
    }, 10000);
  }

  function setupNotifications(device: Device) {
    monitorCharacteristic(device, SERVICE_UUID, TANK_STATUS_UUID, 'Tank Status', (value) => {
      const tank1 = parseInt(value.substring(0, 2), 16);
      const tank2 = parseInt(value.substring(2, 4), 16);
      const tank3 = parseInt(value.substring(4, 6), 16);

      console.log(`Tank 1 Status: ${tank1}, Tank 2 Status: ${tank2}, Tank 3 Status: ${tank3}`);

      setTank1Status(tank1);
      setTank2Status(tank2);
      setTank3Status(tank3);
    });
  }

  function monitorCharacteristic(
    device: Device,
    serviceUUID: string,
    characteristicUUID: string,
    characteristicName: string,
    setState: (value: string) => void
  ) {
    console.log(`Monitoring characteristic ${characteristicName} (${characteristicUUID})...`);
    device.monitorCharacteristicForService(serviceUUID, characteristicUUID, (error, characteristic) => {
      if (error) {
        console.log(`Erreur de lecture de ${characteristicName} :`, error);
        return;
      }
      if (characteristic?.value) {
        const decodedValue = base64.decode(characteristic.value);
        console.log(`${characteristicName} Value (raw):`, characteristic.value);
        console.log(`${characteristicName} Value (decoded):`, decodedValue);
        setState(decodedValue);
      } else {
        console.log(`${characteristicName} Value is empty or invalid.`);
      }
    });
  }

  async function sendData(selectedRecipe: { red: number, green: number, blue: number }) {
    if (connectedDevice && isConnected) {
      try {
        const redData = base64.encode(String(selectedRecipe.red));
        const greenData = base64.encode(String(selectedRecipe.green));
        const blueData = base64.encode(String(selectedRecipe.blue));

        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, RED_UUID, redData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, GREEN_UUID, greenData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, BLUE_UUID, blueData);

        console.log(`Données envoyées : Rouge=${selectedRecipe.red}, Vert=${selectedRecipe.green}, Bleu=${selectedRecipe.blue}`);
      } catch (error) {
        console.log('Erreur d\'envoi des données :', error);
      }
    } else {
      console.log('Aucun appareil connecté ou service non trouvé.');
    }
  }

  return {
    isConnected,
    connectedDevice,
    isScanning,
    noDevicesFound,
    tank1Status,
    tank2Status,
    tank3Status,
    scanAndConnect,
    sendData,
  };
}
