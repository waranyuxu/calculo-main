import { NavigationBar } from "expo-navigation-bar";
import { Stack, ThemeProvider, DefaultTheme } from "expo-router";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppThemeProvider } from "@/constants/app-theme";
import { LanguageProvider } from "@/i18n/language";
import { SoundEffectsProvider } from "@/services/sound-effects";
import { initializeStudyReminderNotifications } from "@/services/study-reminder-service";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    void initializeStudyReminderNotifications();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <LanguageProvider>
          <AppThemeProvider>
            <SoundEffectsProvider>
              {Platform.OS === "android" ? (
                <NavigationBar hidden style="light" />
              ) : null}
              <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
            </SoundEffectsProvider>
          </AppThemeProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
