import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Picker, Button, TextInput, ScrollView, Alert } from 'react-native';

export default function App() {
  const [estaciones, setEstaciones] = useState([]);
  const [selectedEstacion, setSelectedEstacion] = useState(null);
  const [form, setForm] = useState({ descripcion: '', fecha_inicio: '', fecha_fin: '', motivo: '' });
  const [conflictos, setConflictos] = useState(null);

  useEffect(() => {
    fetch('http://10.0.2.2:5000/estaciones')  // Cambiar IP si usás dispositivo físico
      .then(res => res.json())
      .then(setEstaciones);
  }, []);

  const verificarYEnviar = async () => {
    if (!selectedEstacion) return;
    const res = await fetch(`http://10.0.2.2:5000/verificar_conflictos/${selectedEstacion}`);
    const data = await res.json();
    setConflictos(data);

    if (!data.hay_conflictos) {
      await fetch('http://10.0.2.2:5000/cortes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id_estacion_salida: selectedEstacion }),
      });
      Alert.alert("✅ Corte registrado correctamente.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>App Cortes UTE (Mobile)</Text>
      <Text>Seleccionar estación:</Text>
      <Picker
        selectedValue={selectedEstacion}
        onValueChange={(itemValue) => setSelectedEstacion(itemValue)}>
        <Picker.Item label="Seleccione una estación" value={null} />
        {estaciones.map(est => (
          <Picker.Item key={est.id_estacion_salida} label={est.nombre} value={est.id_estacion_salida} />
        ))}
      </Picker>
      <TextInput placeholder="Descripción" style={styles.input} onChangeText={(text) => setForm({ ...form, descripcion: text })} />
      <TextInput placeholder="Fecha inicio (YYYY-MM-DD HH:MM)" style={styles.input} onChangeText={(text) => setForm({ ...form, fecha_inicio: text })} />
      <TextInput placeholder="Fecha fin (YYYY-MM-DD HH:MM)" style={styles.input} onChangeText={(text) => setForm({ ...form, fecha_fin: text })} />
      <TextInput placeholder="Motivo" style={styles.input} onChangeText={(text) => setForm({ ...form, motivo: text })} />
      <Button title="Planificar Corte" onPress={verificarYEnviar} />

      {conflictos?.hay_conflictos && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>⚠ Hay conflictos:</Text>
          {conflictos.solicitudes.map(s => (
            <Text key={s.id_solicitud}>🛠 {s.descripcion}</Text>
          ))}
          {conflictos.alarmas.map(a => (
            <Text key={a.id_alarma}>🚨 {a.descripcion}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
  },
  alert: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
  },
  alertText: {
    fontWeight: 'bold',
    color: '#856404',
  }
});
