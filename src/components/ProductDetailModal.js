import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, IconButton, Divider, Card, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../configs/config';

export default function ProductDetailModal({ visible, onClose, product }) {
    const [reviews, setReviews] = useState([]), [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && product?._id) {
            (async () => {
                setLoading(true);
                try { const { data } = await axios.get(`${API_BASE_URL}/reviews/product/${product._id}`); setReviews(data); } 
                catch (e) { console.log(e); } finally { setLoading(false); }
            })();
        }
    }, [visible, product]);

    if (!product) return null;
    const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <IconButton icon="close" style={styles.closeBtn} onPress={onClose} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Image source={{ uri: product.image }} style={styles.img} />
                        <View style={styles.infoWrap}>
                            <View style={styles.rowBetween}><Text style={styles.name}>{product.name}</Text><Text style={styles.price}>₱{Number(product.price).toFixed(2)}</Text></View>
                            <View style={styles.ratingRow}><MaterialCommunityIcons name="star" size={20} color="#F1C40F" /><Text style={styles.ratingText}>{avgRating} ({reviews.length} reviews)</Text></View>
                            <Text style={styles.desc}>{product.description || "No description available."}</Text>
                        </View>
                        <Divider style={styles.div} />
                        <Text style={styles.secTitle}>Customer Reviews</Text>
                        {loading ? <ActivityIndicator color="#6F4E37" style={{ marginVertical: 30 }} /> : !reviews.length ? (
                            <View style={styles.emptyWrap}><MaterialCommunityIcons name="comment-quote-outline" size={40} color="#CCC" /><Text style={styles.empty}>No reviews yet.</Text></View>
                        ) : reviews.map((r, i) => (
                            <Card key={i} style={styles.reviewCard}>
                                <Card.Content style={styles.rRow}>
                                    <Avatar.Icon size={40} icon="account" style={styles.avatar} color="#FFF" />
                                    <View style={styles.rInfo}>
                                        <View style={styles.rowBetween}><Text style={styles.rUser}>{r.user?.name || 'Coffee Lover'}</Text><Text style={styles.rDate}>{new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text></View>
                                        <View style={styles.stars}>{[1,2,3,4,5].map(s => <MaterialCommunityIcons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color="#F1C40F" />)}</View>
                                        <Text style={styles.rComment}>{r.comment}</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 35, maxHeight: '90%' }, closeBtn: { position: 'absolute', top: 5, right: 10, zIndex: 10 },
    img: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#EEE', marginBottom: 15 }, infoWrap: { marginBottom: 15 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32', flex: 1 }, price: { fontSize: 20, fontWeight: '900', color: '#6F4E37' }, ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 },
    ratingText: { fontSize: 14, color: '#555', marginLeft: 5, fontWeight: 'bold' }, desc: { fontSize: 14, color: '#666', lineHeight: 22 }, div: { marginVertical: 15, backgroundColor: '#EFEFEF', height: 1 },
    secTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32', marginBottom: 15 }, emptyWrap: { alignItems: 'center', marginVertical: 20, opacity: 0.7 }, empty: { fontSize: 14, color: '#888', marginTop: 10 },
    reviewCard: { backgroundColor: '#FAF5F0', marginBottom: 12, borderRadius: 12, elevation: 0 }, rRow: { flexDirection: 'row', alignItems: 'flex-start' }, avatar: { backgroundColor: '#D2B48C', marginRight: 12 },
    rInfo: { flex: 1 }, rUser: { fontWeight: 'bold', color: '#333', fontSize: 14 }, rDate: { fontSize: 11, color: '#AAA' }, stars: { flexDirection: 'row', marginVertical: 4 }, rComment: { fontSize: 13, color: '#555', lineHeight: 18, marginTop: 4 }
});