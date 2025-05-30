import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  Keyboard,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  InputAccessoryView,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../ThemedText';
import { useGlobalContext } from '../../context/GlobalProvider';
import StandarButton from '../StandarBtn';
import { useTheme } from '../../context/ThemeContext';
import { writeUserReport } from '../../components/services/FirebaseService';

const INPUT_ACCESSORY_VIEW_ID = 'uniqueID';

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function ReportIssue() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [contentError, setContentError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [contentTouched, setContentTouched] = useState(false);
  const { setSlidebarSelected } = useGlobalContext();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      // Clean up form state when component unmounts
      resetForm();
    };
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setContent('');
    setNameError('');
    setEmailError('');
    setContentError('');
    setNameTouched(false);
    setEmailTouched(false);
    setContentTouched(false);
  };

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }
  };

  const validateEmailField = (value: string) => {
    if (!value.trim()) {
      setEmailError('Email is required');
    } else if (!validateEmail(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const validateContent = (value: string) => {
    if (!value.trim()) {
      setContentError('Content is required');
    } else {
      setContentError('');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setNameTouched(true);
    setEmailTouched(true);
    setContentTouched(true);

    validateName(name);
    validateEmailField(email);
    validateContent(content);

    if (!name.trim() || !email.trim() || !content.trim() || !validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const result = await writeUserReport({ name, email, content });
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        resetForm();
        setSlidebarSelected('ThanksReport');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderInputAccessory = () => {
    if (Platform.OS === 'ios') {
      return (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
          <SafeAreaView edges={['bottom']} style={[styles.inputAccessory, { backgroundColor: Colors[theme].opacityBtn }]}>
            <TouchableOpacity onPress={dismissKeyboard} style={styles.doneButton}>
              <Text style={[styles.doneButtonText, { color: Colors[theme].focusColor }]}>Done</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </InputAccessoryView>
      );
    }
    return null;
  };

  const isFormValid = name.trim() && email.trim() && content.trim() && validateEmail(email);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: keyboardHeight }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.textSelected, { color: Colors[theme].focusColor }]}>Settings</Text>
          <ThemedText style={styles.title}>Report an issue</ThemedText>
          <ThemedText style={styles.subtitle}>We appreciate your time and effort for reporting an issue.</ThemedText>
          
          <TextInput
            style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
            placeholder="Name"
            placeholderTextColor={Colors[theme].placeholderColor}
            onChangeText={(text) => {
              setName(text);
              if (nameTouched) validateName(text);
            }}
            onBlur={() => {
              setNameTouched(true);
              validateName(name);
            }}
            value={name}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current.focus()}
            blurOnSubmit={false}
            inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_VIEW_ID : undefined}
          />
          {nameTouched && nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          
          <TextInput
            ref={emailInputRef}
            style={[styles.optionCont, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
            placeholder="Email"
            placeholderTextColor={Colors[theme].placeholderColor}
            onChangeText={(text) => {
              setEmail(text);
              if (emailTouched) validateEmailField(text);
            }}
            onBlur={() => {
              setEmailTouched(true);
              validateEmailField(email);
            }}
            value={email}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => contentInputRef.current.focus()}
            blurOnSubmit={false}
            inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_VIEW_ID : undefined}
          />
          {emailTouched && emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <TextInput
            ref={contentInputRef}
            multiline={true}
            style={[styles.optionCont, styles.textarea, { backgroundColor: Colors[theme].opacityBtn, borderColor: Colors[theme].borderColor, color: Colors[theme].textColor }]}
            placeholder="Describe the issue"
            placeholderTextColor={Colors[theme].placeholderColor}
            onChangeText={(text) => {
              setContent(text);
              if (contentTouched) validateContent(text);
            }}
            onBlur={() => {
              setContentTouched(true);
              validateContent(content);
            }}
            value={content}
            textAlignVertical="top"
            inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_VIEW_ID : undefined}
          />
          {contentTouched && contentError ? <Text style={styles.errorText}>{contentError}</Text> : null}
          
          <StandarButton 
            onPress={handleSubmit} 
            style={[
              styles.submitBtn, 
              { 
                backgroundColor: Colors[theme].focusColor,
                opacity: isSubmitting || !isFormValid ? 0.5 : 1 
              }
            ]}
            disabled={isSubmitting || !isFormValid}
          >
            <Text style={styles.btnText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
          </StandarButton>
        </ScrollView>
        {renderInputAccessory()}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
    marginBottom: 8,
  },
  textSelected: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionCont: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 2,
  },
  textarea: {
    height: 145,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlignVertical: 'top',
    paddingVertical: 16
  },
  submitBtn: {
    marginTop: 16,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  inputAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  doneButton: {
    padding: 10,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});