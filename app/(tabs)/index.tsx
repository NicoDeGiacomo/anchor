import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anchor</Text>

      <View style={styles.buttonContainer}>
        <Link href="/panic" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Panic Attack</Text>
          </Pressable>
        </Link>

        <Link href="/about" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>About</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 24,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '400',
  },
});
