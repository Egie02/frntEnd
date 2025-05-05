import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'expo-router';  
import { aboutData, privacyData } from './settingsContent';


// Higher order component to inject router, dispatch and auth state
const withNavigation = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    return <WrappedComponent {...props} router={router} dispatch={dispatch} user={user} />;
  };
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAbout: false,
      showPrivacy: false,
      aboutContent: aboutData,
    };
  }

  toggleAbout = () => {
    this.setState(prevState => ({
      showAbout: !prevState.showAbout,
      showPrivacy: false,
    }));
  }

  togglePrivacy = () => {
    this.setState(prevState => ({
      showPrivacy: !prevState.showPrivacy,
      showAbout: false,
    }));
  }

  renderAboutContent() {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>{aboutData.cooperative_name}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            {aboutData.historical_background.origin}
          </Text>
        </View>

        {[
          { title: aboutData.mission, content: aboutData.micontent.content },
          { title: aboutData.vision, content: aboutData.vcontent.content },
          { title: aboutData.goal, content: aboutData.gcontent.content }
        ].map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>{item.content}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{aboutData.core}</Text>
          {Object.values(aboutData.cvcontent).map((value, index) => (
            <Text key={index} style={styles.bulletPoint}>• {value}</Text>
          ))}
        </View>
      </View>
    );
  }

  renderPrivacyContent() {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>{privacyData.title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionText}>{privacyData.introduction}</Text>
        </View>

        {privacyData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((item, idx) => (
              <Text key={idx} style={styles.bulletPoint}>• {item}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  renderAboutView() {
    const { aboutContent } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {aboutContent ? this.renderAboutContent() : (
            <Text style={styles.loadingText}>
              Loading about information...
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={this.toggleAbout}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderPrivacyView() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {this.renderPrivacyContent()}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={this.togglePrivacy}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderMainView() {
    const { router, user } = this.props;
    
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Settings</Text>

        <TouchableOpacity 
          style={[styles.button, styles.aboutButton]} 
          onPress={this.toggleAbout}
        >
          <Text style={styles.buttonText}>Information</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.privacyButton]} 
          onPress={this.togglePrivacy}
        >
          <Text style={styles.buttonText}>Data Privacy</Text>
        </TouchableOpacity>

        {/* Commented out ChangePIN functionality
        {user?.data?.[0]?.OTCP?.toUpperCase() === 'GRANTED' && (
          <TouchableOpacity 
            style={[styles.button, styles.changePINButton]} 
            onPress={() => router.push('/(mobile)/ChangePassword')}
          >
            <Text style={styles.buttonText}>Change PIN</Text>
          </TouchableOpacity>
        )}
        */}
      </View>
    );
  }

  render() {
    const { showAbout, showPrivacy } = this.state;
    if (showAbout) return this.renderAboutView();
    if (showPrivacy) return this.renderPrivacyView();
    return this.renderMainView();
  }
}

export default withNavigation(Settings);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  aboutContent: {
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#444',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  aboutButton: {
    backgroundColor: '#3F51B5',
  },
  privacyButton: {
    backgroundColor: '#00796B',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  closeButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#444',
    textAlign: 'justify',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  /* Commented out ChangePIN button style
  changePINButton: {
    backgroundColor: '#673AB7',
  },
  */
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  section: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#303F9F',
    marginBottom: 10,
    textAlign: 'left',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    marginLeft: 10,
    marginBottom: 5,
  },
});
