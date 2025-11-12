import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile, setUpRecaptcha, signInWithPhone, clearRecaptcha } from '@/services/authService';
import { saveUserData, updatePhoneVerificationStatus } from '@/services/userService';
import { Phone, User, Building, MapPin, CheckCircle } from 'lucide-react';


interface RegistrationFormProps {
  onComplete: () => void;
}

export function RegistrationForm({ onComplete }: RegistrationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.displayName || '',
    celular: '',
    empresa: '',
    tipoEmpresa: '',
    puesto: '',
    codigoPostal: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify' | 'complete'>('form');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);


  const tiposEmpresa = [
    'CONTRATISTA',
    'INVERSIONISTA',
    'PROVEEDOR'
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        const container = document.getElementById('recaptcha-container');
        if (container) {
          const verifier = setUpRecaptcha('recaptcha-container');
          setRecaptchaVerifier(verifier);
          verifier.render();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (recaptchaVerifier) {
          clearRecaptcha(recaptchaVerifier);
        }
      };
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendVerification = async () => {

    if (!recaptchaVerifier) {
      alert('reCAPTCHA not ready. Please try again.');
      return;
    }

    if (!user) {
      alert('No user logged in. Please login first.');
      return;
    }

    // Validate required fields
    if (!formData.nombre || !formData.celular || !formData.empresa || !formData.tipoEmpresa) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsVerifying(true);


      // First, save the user data to Firestore (without phone verification)
      await saveUserData(user, {
        nombre: formData.nombre,
        celular: formData.celular,
        empresa: formData.empresa,
        tipoEmpresa: formData.tipoEmpresa,
        puesto: formData.puesto,
        codigoPostal: formData.codigoPostal,
        phoneVerified: false,
        registrationComplete: false,
      });


      // Update user profile with display name
      await updateUserProfile(formData.nombre);

      // Send SMS verification
      const phoneNumber = `+52${formData.celular.replace(/\D/g, '')}`; // Clean and format phone number
      const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);

      // Store confirmation result for later use
      (window as any).confirmationResult = confirmationResult;

      setVerificationStep('verify');
    } catch (error: any) {
      console.error('Error sending verification SMS:', error);
      const errorMessage = error?.message || 'Error sending verification SMS. Please try again.';
      alert(errorMessage);
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

      // Update user data to mark registration as complete
      await saveUserData(user, {
        phoneVerified: true,
        registrationComplete: true,
      });

      setVerificationStep('complete');

      // Complete registration after a short delay
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error: any) {
      console.error('Error verifying code:', error);
      const errorMessage = error?.message || 'Invalid verification code. Please try again.';
      alert(errorMessage);
    }
  };

  const renderForm = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">REGISTRO</h1>
        <p className="text-gray-600">Completa tu información para continuar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
              NOMBRE
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="nombre"
                type="text"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="pl-10 border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="celular" className="text-sm font-medium text-gray-700">
              CELULAR
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="celular"
                type="tel"
                placeholder="Número de celular"
                value={formData.celular}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                className="pl-10 border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="empresa" className="text-sm font-medium text-gray-700">
              EMPRESA
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="empresa"
                type="text"
                placeholder="Nombre de la empresa"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                className="pl-10 border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipoEmpresa" className="text-sm font-medium text-gray-700">
              TIPO DE EMPRESA
            </Label>
            <select
              id="tipoEmpresa"
              value={formData.tipoEmpresa}
              onChange={(e) => handleInputChange('tipoEmpresa', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Selecciona tipo</option>
              {tiposEmpresa.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="puesto" className="text-sm font-medium text-gray-700">
              PUESTO DE TRABAJO
            </Label>
            <Input
              id="puesto"
              type="text"
              placeholder="Tu puesto"
              value={formData.puesto}
              onChange={(e) => handleInputChange('puesto', e.target.value)}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="codigoPostal" className="text-sm font-medium text-gray-700">
              CÓDIGO POSTAL
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="codigoPostal"
                type="text"
                placeholder="Código postal"
                value={formData.codigoPostal}
                onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                className="pl-10 border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* reCAPTCHA container */}
      <div className="mt-8" id="recaptcha-container"></div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSendVerification}
          disabled={!formData.nombre || !formData.celular || !formData.empresa || !formData.tipoEmpresa || isVerifying}
          className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-3 text-lg font-medium"
        >
          {isVerifying ? 'Enviando...' : 'REGISTRARME'}
        </Button>
      </div>

      
    </div>
  );

  const renderVerification = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Verificación</h2>
        <p className="text-gray-600">
          Ingresa el código de 6 dígitos que enviamos a tu celular
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {formData.celular}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
            CÓDIGO DE VERIFICACIÓN
          </Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="border-blue-300 focus:border-blue-500 text-center text-2xl tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setVerificationStep('form')}
            className="flex-1"
          >
            Atrás
          </Button>
          <Button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6}
            className="flex-1 bg-blue-900 text-white hover:bg-blue-800"
          >
            Verificar
          </Button>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-900 mb-2">¡Registro Completo!</h2>
      <p className="text-gray-600">
        Tu información ha sido verificada exitosamente. Redirigiendo al dashboard...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {verificationStep === 'form' && renderForm()}
      {verificationStep === 'verify' && renderVerification()}
      {verificationStep === 'complete' && renderComplete()}
    </div>
  );
}