import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PromoList({ route, navigation }) {
  const { promos = [] } = route.params || {};

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('PromoDetail', { promo: item })} mode="elevated">
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="ticket-percent" size={32} color="#6F4E37" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.expiry}>Valid until: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
      </View>
    </Card>
  );

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" iconColor="#4A3B32" onPress={() => navigation.goBack()} />
        <Text style={styles.hTitle}>Promotions</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList 
        data={promos} 
        keyExtractor={i => i._id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No active promotions</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF7F5' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  list: { padding: 15 },
  card: { marginBottom: 12, borderRadius: 15, backgroundColor: '#FFF' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconBox: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#FDF7F2', justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  desc: { color: '#666', fontSize: 13, marginTop: 4 },
  expiry: { color: '#999', fontSize: 11, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 100, color: '#AAA' }
});