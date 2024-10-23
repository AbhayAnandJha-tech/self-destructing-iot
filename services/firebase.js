// src/services/firebase.js
import { db, storage } from '../lib/firebase/config'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const FirebaseService = {
  // Device Management
  async registerDevice(deviceInfo) {
    try {
      const docRef = await addDoc(collection(db, 'devices'), {
        ...deviceInfo,
        status: 'active',
        registeredAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error registering device:', error)
      throw error
    }
  },

  async updateDeviceStatus(deviceId, status) {
    try {
      const deviceRef = doc(db, 'devices', deviceId)
      await updateDoc(deviceRef, {
        status,
        lastUpdated: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating device status:', error)
      throw error
    }
  },

  // Data Storage
  async storeFinalData(deviceId, finalData) {
    try {
      // Store in Firestore
      const docRef = await addDoc(collection(db, 'device_final_data'), {
        deviceId,
        timestamp: serverTimestamp(),
        data: finalData,
      })

      // Store detailed data in Storage
      const storageRef = ref(
        storage,
        `device_data/${deviceId}/final_dump_${Date.now()}.json`
      )
      const blob = new Blob([JSON.stringify(finalData)], {
        type: 'application/json',
      })
      await uploadBytes(storageRef, blob)
      const downloadUrl = await getDownloadURL(storageRef)

      return {
        docId: docRef.id,
        storageUrl: downloadUrl,
      }
    } catch (error) {
      console.error('Error storing final data:', error)
      throw error
    }
  },

  // Alert Management
  async createAlert(alertData) {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), {
        ...alertData,
        timestamp: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  },

  async getDeviceAlerts(deviceId) {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('deviceId', '==', deviceId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching device alerts:', error)
      throw error
    }
  },

  // Data Retrieval
  async getFinalData(deviceId) {
    try {
      const q = query(
        collection(db, 'device_final_data'),
        where('deviceId', '==', deviceId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching final data:', error)
      throw error
    }
  },
}

export default FirebaseService
