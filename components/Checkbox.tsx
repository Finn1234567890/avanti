import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/theme/colors'
import { Linking } from 'react-native'

type Props = {
  checked: boolean
  onCheck: () => void
}

export function Checkbox({ checked, onCheck }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onCheck}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Ionicons name="checkmark" size={16} color={colors.text.light} />}
      </View>
      <Text style={styles.label}>Ich akzeptiere die <Text
        style={styles.link}
        onPress={() => Linking.openURL('https://policiesavanti.vercel.app/terms')}
      >
        Nutzungsbedingungen
      </Text> und den Verhaltenskodex</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.accent.primary,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
}) 