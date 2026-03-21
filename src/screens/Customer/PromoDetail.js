import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Share, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message'; 

export default function PromoDetail({ route, navigation }) {
  const { promo } = route.params;
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const isNotif = !!promo.message && !promo.validUntil;
  const title = isNotif ? promo.title.replace('🎁 ', '') : promo.title;
  const code = isNotif ? (promo.message.match(/Use code: (.*)/)?.[1] || 'PROMO') : promo.code;
  let desc = isNotif ? promo.message.split('. Use code:')[0] : promo.description;
  
  const validUntil = isNotif ? new Date(new Date(promo.createdAt).getTime() + 7 * 86400000) : new Date(promo.validUntil);
  const isExp = validUntil < new Date();

  let iconName = 'ticket-percent';
  let bannerVal = 'SPECIAL OFFER';

  if (isNotif) {
    if (desc.includes('% OFF')) { bannerVal = desc.split(':')[0]; iconName = 'percent'; }
    else if (desc.includes('₱') && desc.includes('OFF')) { bannerVal = desc.split(':')[0]; iconName = 'currency-php'; }
    else if (desc.includes('FREE DELIVERY')) { bannerVal = 'FREE SHIPPING'; iconName = 'truck-fast'; }
    else if (desc.includes('MEGA DEAL')) { bannerVal = 'MEGA DEAL'; iconName = 'star-shooting'; }
    desc = desc.split(': ')[1] || desc; 
  } else {
    if (promo.type === 'Percentage') { bannerVal = `${promo.value}% OFF`; iconName = 'percent'; }
    else if (promo.type === 'Fixed') { bannerVal = `₱${promo.value} OFF`; iconName = 'currency-php'; }
    else if (promo.type === 'FreeShipping') { bannerVal = 'FREE SHIPPING'; iconName = 'truck-fast'; }
    else if (promo.type === 'SpecialDeal') { bannerVal = `₱${promo.value} DEAL`; iconName = 'star-shooting'; }
  }

  const onShare = async () => {
    try { await Share.share({ message: `I found a ${bannerVal} deal at ExpoBrew! Use code: ${code}` }); } catch (e) { }
  };

  const handleApplyCode = async () => {
    await Clipboard.setStringAsync(code);
    Toast.show({
      type: 'success',
      text1: 'Code Copied!',
      text2: `Voucher code '${code}' is ready to use at checkout.`,
      position: 'bottom'
    });
    navigation.navigate('Home');
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
                {isExp ? 'EXPIRED' : `Valid until ${validUntil.toLocaleDateString()}`}
              </Chip>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Divider style={styles.div} />
            <Text style={styles.secTitle}>Terms & Description</Text>
            <Text style={styles.msg}>{desc}</Text>
            
            <TouchableOpacity style={styles.codeBox} onPress={() => setIsCodeVisible(!isCodeVisible)} activeOpacity={0.7}>
              <Text style={styles.codeLabel}>VOUCHER CODE</Text>
              <Text style={[styles.codeVal, isExp && { textDecorationLine: 'line-through', color: '#999' }]}>
                {isCodeVisible ? code : '••••••••'}
              </Text>
              <Text style={styles.codeSub}>{isExp ? 'This code is no longer valid' : 'Tap to reveal or hide code'}</Text>
            </TouchableOpacity>

          </Card.Content>
        </Card>

        <Button mode="contained" buttonColor={isExp ? '#CCC' : "#6F4E37"} disabled={isExp} style={styles.btn} onPress={handleApplyCode}>
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
  codeVal: { fontSize: 32, fontWeight: '900', color: '#4A3B32', letterSpacing: 2, marginVertical: 5 },
  codeSub: { fontSize: 10, color: '#A0938A', marginTop: 5 },
  btn: { marginTop: 25, borderRadius: 12, paddingVertical: 5 }
});