import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Save, RefreshCw, Database, Bell, User, Shield, Phone, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { setUpRecaptcha, signInWithPhone } from '@/services/authService'
import { getUserData, updatePhoneVerificationStatus, saveUserData } from '@/services/userService'

export function Settings() {
  const { user, isPhoneVerified } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sending' | 'verify'>('idle');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleDarkModeToggle = (checked: boolean) => {
    //TODO: I need to work on the dark version because not dark all the elements
    //setIsDarkMode(checked);
  };

  useEffect(() => {
    // Load user's phone number if available
    debugger;
    const loadUserData = async () => {
      if (user) {
        const userData = await getUserData(user);
        if (userData?.celular) {
          setPhoneNumber(userData.celular);
        }
      }
    };
    loadUserData();

    // Set up reCAPTCHA
    if (typeof window !== 'undefined') {
      //const verifier = setUpRecaptcha('recaptcha-container-settings');
      //setRecaptchaVerifier(verifier);
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!recaptchaVerifier || !user) {
      alert('reCAPTCHA not ready or user not logged in. Please try again.');
      return;
    }

    if (!phoneNumber) {
      alert('Por favor ingresa tu número de teléfono.');
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationStep('sending');
      
      // Update user data with phone number
      await saveUserData(user, {
        celular: phoneNumber,
        phoneVerified: false,
      });

      // Send SMS verification
      const formattedPhone = `+52${phoneNumber.replace(/\D/g, '')}`;
      const confirmationResult = await signInWithPhone(formattedPhone, recaptchaVerifier);
      
      // Store confirmation result for later use
      (window as any).confirmationResult = confirmationResult;
      
      setVerificationStep('verify');
    } catch (error: any) {
      console.error('Error sending verification SMS:', error);
      alert(error?.message || 'Error sending verification SMS. Please try again.');
      setVerificationStep('idle');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user) {
      alert('No user logged in. Please login first.');
      return;
    }

    try {
      const confirmationResult = (window as any).confirmationResult;
      if (!confirmationResult) {
        throw new Error('No confirmation result found');
      }

      // Verify the code
      await confirmationResult.confirm(verificationCode);
      
      // Update phone verification status in Firestore
      await updatePhoneVerificationStatus(user, true);
      
      setVerificationStep('idle');
      setVerificationCode('');
      alert('¡Número de teléfono verificado exitosamente!');
      
      // Reload to update the banner
      window.location.reload();
    } catch (error: any) {
      console.error('Error verifying code:', error);
      alert(error?.message || 'Invalid verification code. Please try again.');
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your application preferences</p>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Configuration
          </CardTitle>
          <CardDescription>Configure your PostgreSQL connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="db-host">Host</Label>
              <Input id="db-host" defaultValue="localhost" />
            </div>
            <div>
              <Label htmlFor="db-port">Port</Label>
              <Input id="db-port" defaultValue="5432" />
            </div>
            <div>
              <Label htmlFor="db-name">Database Name</Label>
              <Input id="db-name" defaultValue="tesis" />
            </div>
            <div>
              <Label htmlFor="db-user">Username</Label>
              <Input id="db-user" defaultValue="postgres" />
            </div>
          </div>
          <div>
            <Label htmlFor="db-password">Password</Label>
            <Input id="db-password" type="password" />
          </div>
          <div className="flex gap-2">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Database Settings
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="price-alerts">Price Alerts</Label>
              <p className="text-sm text-gray-500">Get notified of significant price changes</p>
            </div>
            <Switch id="price-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <p className="text-sm text-gray-500">Receive weekly summary reports</p>
            </div>
            <Switch id="weekly-reports" />
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Preferences
          </CardTitle>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select 
                id="language" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select 
                id="timezone" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="UTC"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-gray-500">Use dark theme</p>
            </div>
            <Switch id="dark-mode" checked={isDarkMode}
              onCheckedChange={handleDarkModeToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Verificación de Teléfono
          </CardTitle>
          <CardDescription>Verifica tu número de teléfono para mayor seguridad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPhoneVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Tu número de teléfono está verificado</span>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="phone-number">Número de Teléfono</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={verificationStep !== 'idle'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tu número de teléfono (10 dígitos)
                </p>
              </div>

              {verificationStep === 'verify' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label htmlFor="verification-code">Código de Verificación</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Ingresa el código de 6 dígitos que enviamos a tu teléfono
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVerificationStep('idle');
                        setVerificationCode('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                    >
                      Verificar Código
                    </Button>
                  </div>
                </div>
              )}

              {verificationStep === 'idle' && (
                <Button
                  onClick={handleSendVerification}
                  disabled={!phoneNumber || isVerifying}
                >
                  {isVerifying ? 'Enviando...' : 'Enviar Código de Verificación'}
                </Button>
              )}

              {/* reCAPTCHA container */}
              <div id="recaptcha-container-settings"></div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
