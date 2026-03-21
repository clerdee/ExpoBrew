import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Text, Card, IconButton, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PromoDetail({ route, navigation }) {
  const { promo } = route.params;
  const isExp = new Date(promo.validUntil) < new Date();

  let iconName = 'ticket-percent';
  let bannerVal = '';
  if (promo.type === 'Percentage') bannerVal = `${promo.value}% OFF`;
  else if (promo.type === 'Fixed') { bannerVal = `₱${promo.value} OFF`; iconName = 'currency-php'; }
  else if (promo.type === 'FreeShipping') { bannerVal = 'FREE SHIPPING'; iconName = 'truck-fast'; }
  else if (promo.type === 'SpecialDeal') { bannerVal = `₱${promo.value} DEAL`; iconName = 'star-shooting'; }

  const onShare = async () => {
    try { await Share.share({ message: `I found a ${bannerVal} deal at ExpoBrew! Use code: ${promo.code}` }); } catch (e) { }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" iconColor="#4A3B32" onPress={() => navigation.goBack()} />
        <Text style={styles.hTitle}>Voucher Details</Text>
        <IconButton icon="share-variant" iconColor="#4A3B32" onPress={onShare} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={[styles.card, isExp && { opacity: 0.8 }]}>
          <View style={[styles.banner, isExp && { backgroundColor: '#999' }]}>
            <MaterialCommunityIcons name={iconName} size={60} color="#FFF" style={{ marginBottom: 10 }} />
            <Text style={styles.bText}>{bannerVal}</Text>
          </View>
          
          <Card.Content style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
              <Chip icon="clock-outline" textStyle={{ color: isExp ? '#D32F2F' : '#E67E22', fontSize: 12, fontWeight: 'bold' }} style={{ backgroundColor: isExp ? '#FFEBEE' : '#FDF7F2' }}>
                {isExp ? 'EXPIRED' : `Valid until ${new Date(promo.validUntil).toLocaleDateString()}`}
              </Chip>
            </View>

            <Text style={styles.title}>{promo.title}</Text>
            <Divider style={styles.div} />
            <Text style={styles.secTitle}>Terms & Description</Text>
            <Text style={styles.msg}>{promo.description}</Text>
            
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>VOUCHER CODE</Text>
              <Text style={[styles.codeVal, isExp && { textDecorationLine: 'line-through', color: '#999' }]}>{promo.code}</Text>
              <Text style={styles.codeSub}>{isExp ? 'This code is no longer valid' : 'Tap to copy and use at checkout'}</Text>
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" buttonColor={isExp ? '#CCC' : "#6F4E37"} disabled={isExp} style={styles.btn} onPress={() => navigation.navigate('Home')}>
          {isExp ? 'DEAL EXPIRED' : 'ORDER NOW & APPLY CODE'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF7F5' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF' },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' }, scroll: { padding: 20 },
  card: { borderRadius: 25, overflow: 'hidden', backgroundColor: '#FFF', elevation: 4 },
  banner: { height: 160, backgroundColor: '#6F4E37', justifyContent: 'center', alignItems: 'center' },
  bText: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#4A3B32', textAlign: 'center', marginTop: 5 },
  div: { marginVertical: 15 }, secTitle: { fontSize: 12, fontWeight: 'bold', color: '#AAA', textTransform: 'uppercase', marginBottom: 8 },
  msg: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 20 },
  codeBox: { backgroundColor: '#FDF7F2', borderRadius: 15, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#6F4E37', borderStyle: 'dashed' },
  codeLabel: { fontSize: 11, fontWeight: 'bold', color: '#6F4E37', letterSpacing: 1 },
  codeVal: { fontSize: 32, fontWeight: '900', color: '#4A3B32', marginVertical: 5 },
  codeSub: { fontSize: 10, color: '#A0938A' },
  btn: { marginTop: 25, borderRadius: 12, paddingVertical: 5 }
});