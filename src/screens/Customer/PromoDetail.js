import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Text, Card, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PromoDetail({ route, navigation }) {
  const { promo } = route.params;

  const onShare = async () => {
    try { await Share.share({ message: `Check out this deal at ExpoBrew: ${promo.title}! Use code: ${promo.code || 'EXPOBREW'}` });
    } catch (e) { console.log(e); }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" iconColor="#4A3B32" onPress={() => navigation.goBack()} />
        <Text style={styles.hTitle}>Promo Details</Text>
        <IconButton icon="share-variant" iconColor="#4A3B32" onPress={onShare} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <View style={styles.banner}>
            <MaterialCommunityIcons name="gift-outline" size={80} color="#FFF" />
          </View>
          <Card.Content style={{ padding: 20 }}>
            <Text style={styles.title}>{promo.title}</Text>
            <Divider style={styles.div} />
            <Text style={styles.secTitle}>Description</Text>
            <Text style={styles.msg}>{promo.message}</Text>
            
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>VOUCHER CODE</Text>
              <Text style={styles.codeVal}>{promo.code || 'COFFEE2026'}</Text>
              <Text style={styles.codeSub}>Tap to copy and use at checkout</Text>
            </View>

            <Text style={styles.terms}>* Terms and conditions apply. Valid for a limited time only.</Text>
          </Card.Content>
        </Card>
        <Button mode="contained" buttonColor="#6F4E37" style={styles.btn} onPress={() => navigation.navigate('Home')}>
          CLAIM & ORDER NOW
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF7F5' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF' },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  scroll: { padding: 20 },
  card: { borderRadius: 25, overflow: 'hidden', backgroundColor: '#FFF', elevation: 4 },
  banner: { height: 160, backgroundColor: '#6F4E37', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#4A3B32', textAlign: 'center', marginVertical: 10 },
  div: { marginVertical: 15 },
  secTitle: { fontSize: 12, fontWeight: 'bold', color: '#AAA', textTransform: 'uppercase', marginBottom: 8 },
  msg: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 20 },
  codeBox: { backgroundColor: '#FDF7F2', borderRadius: 15, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#6F4E37', borderStyle: 'dashed' },
  codeLabel: { fontSize: 11, fontWeight: 'bold', color: '#6F4E37', letterSpacing: 1 },
  codeVal: { fontSize: 32, fontWeight: '900', color: '#4A3B32', marginVertical: 5 },
  codeSub: { fontSize: 10, color: '#A0938A' },
  terms: { fontSize: 11, color: '#BBB', marginTop: 20, fontStyle: 'italic' },
  btn: { marginTop: 25, borderRadius: 12, paddingVertical: 5 }
});