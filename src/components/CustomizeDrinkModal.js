import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton, Button, Divider, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SIZES = [{ l: 'Tall', p: 0 }, { l: 'Grande', p: 25 }, { l: 'Venti', p: 40 }];
const OPTIONS = {
  milk: [{ l: 'Whole Milk', p: 0 }, { l: 'Non-Fat Milk', p: 10 }, { l: 'Sub Breve', p: 35 }, { l: 'Sub Soymilk', p: 35 }],
  syrups: [{ l: 'Salted Caramel', p: 20 }, { l: 'Vanilla', p: 20 }, { l: 'Hazelnut', p: 20 }, { l: 'Caramel', p: 20 }],
  addons: [{ l: 'Caramel Drizzle', p: 15 }, { l: 'Mocha Sauce', p: 15 }, { l: 'White Mocha Sauce', p: 15 }],
  condiments: ['White Sugar', 'Brown Sugar', 'Splenda', 'Coconut Sugar']
};

export default function CustomizeDrinkModal({ visible, onClose, item, onConfirm }) {
  const [size, setSize] = useState('Tall');
  const [espresso, setEspresso] = useState('Regular');
  const [milk, setMilk] = useState('Whole Milk');
  const [syrups, setSyrups] = useState([]);
  const [extras, setExtras] = useState([]);
  const [condiments, setCondiments] = useState([]);

  const resetAll = () => { setSize('Tall'); setEspresso('Regular'); setMilk('Whole Milk'); setSyrups([]); setExtras([]); setCondiments([]); };
  const milkPrice = OPTIONS.milk.find(m => m.l === milk)?.p || 0;
  const totalPrice = (item?.price || 0) + (SIZES.find(s => s.l === size)?.p || 0) + milkPrice + syrups.reduce((s, i) => s + i.p, 0) + extras.reduce((s, i) => s + i.p, 0);

  const toggle = (list, set, val) => set(list.some(i => i.l === val.l) ? list.filter(i => i.l !== val.l) : [...list, val]);
  const toggleSimple = (list, set, val) => set(list.includes(val) ? list.filter(i => i !== val) : [...list, val]);

  if (!item) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}><View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}><Text style={styles.hText}>Customize Recipe</Text><IconButton icon="close-circle" iconColor="#CCC" size={28} onPress={onClose} /></View>
        
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Image source={{ uri: item.imageUrl || item.image }} style={styles.img} />
            <View style={{flex:1}}><Text style={styles.iName}>{item.name}</Text><Text style={styles.iCat}>{item.category}</Text></View>
            <Text style={styles.iBase}>₱{item.price.toFixed(2)}</Text>
          </View>

          <Text style={styles.sec}>Select Size</Text>
          <View style={styles.sizeRow}>{SIZES.map(s => (
            <TouchableOpacity key={s.l} onPress={()=>setSize(s.l)} style={[styles.sizeCard, size===s.l && styles.activeCard]}>
              <MaterialCommunityIcons name="cup" size={size===s.l?28:22} color={size===s.l?'#6F4E37':'#AAA'} />
              <Text style={[styles.sizeL, size===s.l && styles.activeTxt]}>{s.l}</Text>
              <Text style={styles.plusP}>{s.p > 0 ? `+₱${s.p}` : 'Free'}</Text>
            </TouchableOpacity>
          ))}</View>

          <Text style={styles.sec}>Espresso & Milk</Text>
          <View style={styles.box}>
            <Text style={styles.label}>Espresso Roast</Text>
            <View style={styles.radioContainer}>{['Regular', 'Decaf'].map(v => (
              <TouchableOpacity key={v} onPress={()=>setEspresso(v)} style={styles.touchableRadio} activeOpacity={0.7}>
                <RadioButton value={v} status={espresso===v?'checked':'unchecked'} color="#6F4E37" />
                <Text style={[styles.rTxt, espresso===v && {color:'#6F4E37', fontWeight:'bold'}]}>{v}</Text>
              </TouchableOpacity>
            ))}</View>
            <Divider style={styles.div}/>
            <Text style={styles.label}>Milk Choice</Text>
            <View style={styles.wrap}>{OPTIONS.milk.map(m => (
              <TouchableOpacity key={m.l} onPress={()=>setMilk(m.l)} style={[styles.pill, milk===m.l && styles.pillOn]}>
                <Text style={[styles.pTxt, milk===m.l && styles.pTxtOn]}>{m.l} {m.p > 0 && `(+₱${m.p})`}</Text>
              </TouchableOpacity>
            ))}</View>
          </View>

          <View style={styles.row}><Text style={styles.sec}>Add Syrups</Text><TouchableOpacity onPress={()=>setSyrups([])}><Text style={styles.resetBtn}>Reset</Text></TouchableOpacity></View>
          <View style={styles.wrap}>{OPTIONS.syrups.map(s => (
            <TouchableOpacity key={s.l} onPress={()=>toggle(syrups, setSyrups, s)} style={[styles.pill, syrups.some(x=>x.l===s.l) && styles.pillOn]}>
              <Text style={[styles.pTxt, syrups.some(x=>x.l===s.l) && styles.pTxtOn]}>{s.l} (+₱{s.p})</Text>
            </TouchableOpacity>
          ))}</View>

          <View style={styles.row}><Text style={styles.sec}>Extra Toppings</Text><TouchableOpacity onPress={()=>setExtras([])}><Text style={styles.resetBtn}>Reset</Text></TouchableOpacity></View>
          <View style={styles.wrap}>{OPTIONS.addons.map(e => (
            <TouchableOpacity key={e.l} onPress={()=>toggle(extras, setExtras, e)} style={[styles.pill, extras.some(x=>x.l===e.l) && styles.pillOn]}>
              <Text style={[styles.pTxt, extras.some(x=>x.l===e.l) && styles.pTxtOn]}>{e.l} (+₱{e.p})</Text>
            </TouchableOpacity>
          ))}</View>

          <View style={styles.row}><Text style={styles.sec}>Condiments</Text><TouchableOpacity onPress={()=>setCondiments([])}><Text style={styles.resetBtn}>Reset</Text></TouchableOpacity></View>
          <View style={styles.wrap}>{OPTIONS.condiments.map(c => (
            <TouchableOpacity key={c} onPress={()=>toggleSimple(condiments, setCondiments, c)} style={[styles.pill, condiments.includes(c) && styles.pillOn]}>
              <Text style={[styles.pTxt, condiments.includes(c) && styles.pTxtOn]}>{c}</Text>
            </TouchableOpacity>
          ))}</View>
          
          <Button mode="text" onPress={resetAll} textColor="#D32F2F" style={{marginVertical: 20}}>Reset to Default Recipe</Button>
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <View><Text style={styles.fPrice}>₱{totalPrice.toFixed(2)}</Text><Text style={styles.fSub}>{size} • {espresso} • {milk}</Text></View>
          <Button mode="contained" buttonColor="#6F4E37" onPress={() => onConfirm({ ...item, price: totalPrice, customizations: { size, espresso, milk, syrups, extras, condiments } })} style={styles.btn}>Add to Basket</Button>
        </View>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FAF5F0', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '92%' },
  handle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 10, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 5 },
  hText: { fontSize: 20, fontWeight: '800', color: '#4A3B32' }, scroll: { paddingHorizontal: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginVertical: 10, elevation: 1 },
  img: { width: 70, height: 70, borderRadius: 15, marginRight: 15 },
  iName: { fontWeight: 'bold', fontSize: 18, color: '#333' }, iCat: { color: '#888', fontSize: 12 }, iBase: { fontSize: 18, fontWeight: 'bold', color: '#6F4E37' },
  sec: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginVertical: 12 },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  sizeCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeCard: { borderColor: '#6F4E37', backgroundColor: '#FDF8F4' },
  sizeL: { fontWeight: 'bold', marginTop: 5, color: '#888' }, activeTxt: { color: '#6F4E37' }, plusP: { fontSize: 10, color: '#AAA', fontWeight: 'bold' },
  box: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, elevation: 1 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#BBB', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  touchableRadio: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, flex: 1, justifyContent: 'center' },
  rTxt: { fontWeight: '500', color: '#777', marginLeft: 4 },
  div: { marginVertical: 15, backgroundColor: '#F5F5F5' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetBtn: { fontSize: 12, color: '#6F4E37', fontWeight: 'bold' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  pillOn: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' },
  pTxt: { color: '#444', fontSize: 12, fontWeight: '600' }, pTxtOn: { color: '#FFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F0F0F0', elevation: 20 },
  fPrice: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' }, fSub: { fontSize: 11, color: '#AAA', fontWeight: 'bold' },
  btn: { borderRadius: 15, paddingHorizontal: 20, height: 50, justifyContent: 'center' }
});