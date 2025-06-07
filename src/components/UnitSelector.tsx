import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface UnitSelectorProps {
  units: string[];
  selectedUnit: string;
  onSelect: (unit: string) => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ units, selectedUnit, onSelect }) => {
  return (
    <View style={styles.unitButtonContainer}>
      {units.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[styles.unitButton, selectedUnit === unit && styles.unitButtonSelected]}
          onPress={() => onSelect(unit)}
        >
          <Text style={styles.unitButtonText}>{unit}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  unitButtonContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  unitButton: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  unitButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  unitButtonText: {
    fontSize: 12,
    color: 'black',
  },
});

export default UnitSelector;
