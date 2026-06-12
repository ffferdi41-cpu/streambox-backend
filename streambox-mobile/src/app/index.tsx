import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'https://streambox-backend-p3z4.onrender.com';

export default function HomeScreen( ) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/channels`);
      const data = await response.json();
      setChannels(data.channels || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Kanallar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Streambox IPTV</Text>
      
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Hata: {error}</Text>
        </View>
      )}

      {channels.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Kanal bulunamadı</Text>
          <TouchableOpacity style={styles.button} onPress={fetchChannels}>
            <Text style={styles.buttonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        channels.map((channel, index) => (
          <View key={index} style={styles.channelCard}>
            <Text style={styles.channelName}>{channel.name}</Text>
            <Text style={styles.channelUrl}>{channel.url}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  channelCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  channelUrl: {
    fontSize: 12,
    color: '#999',
  },
});
