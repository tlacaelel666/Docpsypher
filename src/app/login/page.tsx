'use client';
/**
 * @fileOverview Componente de login robusto con validación, seguridad y UX mejorada
 *
 * Mejoras implementadas:
 * - Validación de formulario en tiempo real
 * - Manejo de errores granular
 * - Rate limiting y protección contra ataques
 * - Estados de carga mejorados
 * - Accesibilidad completa
 * - Recuperación de errores
 * - Logging de seguridad
 * - Validación de entrada robusta
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { DocSaferLogo } from '@/components/doc-safer-logo';

// Tipos para el estado del formulario
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// Configuración de seguridad
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minuto
  MAX_REQUESTS_PER_WINDOW: 10,
} as const;

// Configuración de UI
const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_TIMEOUT: 5000,
  LOADING_MIN_DURATION: 1000, // Mínimo tiempo de loading para evitar flashing
} as const;

// Enum para tipos de error
enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  ACCOUNT_LOCKED = 'account_locked',
  SERVER_ERROR = 'server_error'
}

// Interface para métricas de intento de login
interface LoginAttempt {
  timestamp: number;
  email: string;
  success: boolean;
  errorType?: ErrorType;
  userAgent: string;
  ip?: string;
}

/**
 * Hook personalizado para manejo de rate limiting
 */
function useRateLimit() {
  const attempts = useRef<number[]>([]);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    // Limpiar intentos antiguos
    attempts.current = attempts.current.filter(
      timestamp => now - timestamp < SECURITY_CONFIG.RATE_LIMIT_WINDOW
    );
    
    return attempts.current.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW;
  }, []);

  const recordAttempt = useCallback(() => {
    attempts.current.push(Date.now());
  }, []);

  const getRemainingTime = useCallback(() => {
    if (attempts.current.length === 0) return 0;
    const oldestAttempt = Math.min(...attempts.current);
    const remainingTime = SECURITY_CONFIG.RATE_LIMIT_WINDOW - (Date.now() - oldestAttempt);
    return Math.max(0, remainingTime);
  }, []);

  return { isRateLimited, recordAttempt, getRemainingTime };
}

/**
 * Hook para manejo de bloqueo de cuenta
 */
function useAccountLockout() {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);

  const isAccountLocked = useCallback(() => {
    if (!lockoutEnd) return false;
    if (Date.now() > lockoutEnd) {
      setLockoutEnd(null);
      setFailedAttempts(0);
      return false;
    }
    return true;
  }, [lockoutEnd]);

  const recordFailedAttempt = useCallback(() => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    
    if (newFailedAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      setLockoutEnd(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION);
    }
  }, [failedAttempts]);

  const resetAttempts = useCallback(() => {
    setFailedAttempts(0);
    setLockoutEnd(null);
  }, []);

  const getRemainingLockoutTime = useCallback(() => {
    if (!lockoutEnd) return 0;
    return Math.max(0, lockoutEnd - Date.now());
  }, [lockoutEnd]);

  return {
    failedAttempts,
    isAccountLocked,
    recordFailedAttempt,
    resetAttempts,
    getRemainingLockoutTime
  };
}

/**
 * Validador de formulario robusto
 */
class FormValidator {
  static validateEmail(email: string): string | undefined {
    if (!email) return 'El correo electrónico es requerido';
    if (!SECURITY_CONFIG.EMAIL_REGEX.test(email)) {
      return 'El formato del correo electrónico no es válido';
    }
    if (email.length > 254) return 'El correo electrónico es demasiado largo';
    return undefined;
  }

  static validatePassword(password: string): string | undefined {
    if (!password) return 'La contraseña es requerida';
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      return `La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`;
    }
    if (password.length > 128) return 'La contraseña es demasiado larga';
    
    // Verificar caracteres peligrosos
    const dangerousChars = /<script|javascript:|data:/i;
    if (dangerousChars.test(password)) {
      return 'La contraseña contiene caracteres no permitidos';
    }
    
    return undefined;
  }

  static validateForm(formData: FormData): ValidationResult {
    const errors: FormErrors = {};
    
    const emailError = this.validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = this.validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

/**
 * Logger de seguridad
 */
class SecurityLogger {
  static logLoginAttempt(attempt: LoginAttempt) {
    // En producción, esto se enviaría a un servicio de logging
    console.log('[SECURITY] Login attempt:', {
      timestamp: new Date(attempt.timestamp).toISOString(),
      email: attempt.email.replace(/(.{2}).*@/, '$1***@'), // Parcialmente oculto
      success: attempt.success,
      errorType: attempt.errorType,
      userAgent: attempt.userAgent
    });
  }

  static logSuspiciousActivity(activity: string, details: any) {
    console.warn('[SECURITY] Suspicious activity:', activity, details);
  }
}

/**
 * Utilidades de seguridad
 */
class SecurityUtils {
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>\"'&]/g, '');
  }

  static getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  static detectSuspiciousActivity(email: string, password: string): boolean {
    // Detectar patrones sospechosos
    const suspiciousPatterns = [
      /(<script|javascript:|data:)/i,
      /(union|select|insert|delete|drop|create|alter)/i,
      /(\.\.|\/\.|etc\/passwd)/i
    ];

    return suspiciousPatterns.some(pattern => 
      pattern.test(email) || pattern.test(password)
    );
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de seguridad
  const { isRateLimited, recordAttempt, getRemainingTime } = useRateLimit();
  const { 
    failedAttempts, 
    isAccountLocked, 
    recordFailedAttempt, 
    resetAttempts, 
    getRemainingLockoutTime 
  } = useAccountLockout();

  // Referencias
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loadingStartTime = useRef<number>(0);

  // Debounced validation
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);

  // Validación en tiempo real
  const validateField = useCallback((field: keyof FormData, value: string) => {
    if (validationTimer) clearTimeout(validationTimer);
    
    const timer = setTimeout(() => {
      const newErrors = { ...errors };
      
      if (field === 'email') {
        const emailError = FormValidator.validateEmail(value);
        if (emailError) newErrors.email = emailError;
        else delete newErrors.email;
      } else if (field === 'password') {
        const passwordError = FormValidator.validatePassword(value);
        if (passwordError) newErrors.password = passwordError;
        else delete newErrors.password;
      }
      
      setErrors(newErrors);
    }, UI_CONFIG.DEBOUNCE_DELAY);
    
    setValidationTimer(timer);
  }, [errors, validationTimer]);

  // Manejadores de entrada
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    const sanitizedValue = SecurityUtils.sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validación en tiempo real
    validateField(field, sanitizedValue);
  }, [errors, validateField]);

  // Formatear tiempo restante
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }, []);

  // Autenticación simulada mejorada
  const authenticateUser = async (email: string, password: string): Promise<{
    success: boolean;
    errorType?: ErrorType;
    message?: string;
  }> => {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Credenciales dummy para testing
    const validUsers = [
      { email: 'test@test.com', password: 'password' },
      { email: 'admin@docsafer.com', password: 'admin123' },
      { email: 'demo@demo.com', password: 'demo1234' }
    ];

    const user = validUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      return { success: true };
    }

    // Simular diferentes tipos de errores
    if (email === 'blocked@test.com') {
      return { 
        success: false, 
        errorType: ErrorType.ACCOUNT_LOCKED,
        message: 'Cuenta bloqueada por actividad sospechosa'
      };
    }

    if (email === 'server@error.com') {
      return { 
        success: false, 
        errorType: ErrorType.SERVER_ERROR,
        message: 'Error interno del servidor'
      };
    }

    return { 
      success: false, 
      errorType: ErrorType.AUTHENTICATION,
      message: 'Credenciales incorrectas'
    };
  };

  // Manejador de envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Verificar rate limiting
    if (isRateLimited()) {
      const remainingTime = getRemainingTime();
      toast({
        title: "Demasiados intentos",
        description: `Espera ${formatTime(remainingTime)} antes de intentar nuevamente.`,
        variant: "destructive",
      });
      return;
    }

    // Verificar bloqueo de cuenta
    if (isAccountLocked()) {
      const remainingTime = getRemainingLockoutTime();
      toast({
        title: "Cuenta temporalmente bloqueada",
        description: `Tu cuenta está bloqueada por ${formatTime(remainingTime)} debido a múltiples intentos fallidos.`,
        variant: "destructive",
      });
      return;
    }

    // Validar formulario
    const validation = FormValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Enfocar el primer campo con error
      if (validation.errors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (validation.errors.password && passwordRef.current) {
        passwordRef.current.focus();
      }
      
      return;
    }

    // Detectar actividad sospechosa
    if (SecurityUtils.detectSuspiciousActivity(formData.email, formData.password)) {
      SecurityLogger.logSuspiciousActivity('Potential injection attempt', {
        email: formData.email,
        userAgent: SecurityUtils.getUserAgent()
      });
      
      toast({
        title: "Entrada no válida",
        description: "Se detectaron caracteres no permitidos en los datos de entrada.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    loadingStartTime.current = Date.now();
    recordAttempt();

    try {
      const result = await authenticateUser(formData.email, formData.password);
      
      // Asegurar loading mínimo para mejor UX
      const loadingDuration = Date.now() - loadingStartTime.current;
      if (loadingDuration < UI_CONFIG.LOADING_MIN_DURATION) {
        await new Promise(resolve => 
          setTimeout(resolve, UI_CONFIG.LOADING_MIN_DURATION - loadingDuration)
        );
      }

      // Log del intento
      const loginAttempt: LoginAttempt = {
        timestamp: Date.now(),
        email: formData.email,
        success: result.success,
        errorType: result.errorType,
        userAgent: SecurityUtils.getUserAgent()
      };
      SecurityLogger.logLoginAttempt(loginAttempt);

      if (result.success) {
        resetAttempts();
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de vuelta, Guardián.",
        });
        router.push('/dashboard');
      } else {
        recordFailedAttempt();
        
        let errorMessage = result.message || "Las credenciales son incorrectas.";
        let errorTitle = "Error de inicio de sesión";
        
        switch (result.errorType) {
          case ErrorType.ACCOUNT_LOCKED:
            errorTitle = "Cuenta bloqueada";
            break;
          case ErrorType.SERVER_ERROR:
            errorTitle = "Error del servidor";
            errorMessage = "Ha ocurrido un error interno. Por favor, intenta más tarde.";
            break;
          case ErrorType.NETWORK:
            errorTitle = "Error de conexión";
            errorMessage = "Verifica tu conexión a internet e intenta nuevamente.";
            break;
        }
        
        toast({
          title: errorTitle,
          description: `${errorMessage}${failedAttempts > 0 ? ` (${failedAttempts}/${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} intentos)` : ''}`,
          variant: "destructive",
        });

        // Mostrar advertencia si quedan pocos intentos
        if (failedAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - 2) {
          setTimeout(() => {
            toast({
              title: "Advertencia de seguridad",
              description: `Quedan ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - failedAttempts} intentos antes del bloqueo temporal.`,
              variant: "destructive",
            });
          }, 1000);
        }

        // Limpiar contraseña en caso de error
        setFormData(prev => ({ ...prev, password: '' }));
        if (passwordRef.current) {
          passwordRef.current.focus();
        }
      }
    } catch (error) {
      SecurityLogger.logSuspiciousActivity('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: formData.email
      });

      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error inesperado. Por favor, intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [validationTimer]);

  // Estados derivados
  const isSubmitDisabled = isLoading || isRateLimited() || isAccountLocked();
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/" className="text-sm text-primary hover:underline">
            ‹ Volver al Inicio
          </Link>
        </div>
        <Card className="shadow-lg animate-fadeIn border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <DocSaferLogo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Bienvenido a DocSafer</CardTitle>
            <CardDescription>
              {isAccountLocked() 
                ? `Cuenta bloqueada por ${formatTime(getRemainingLockoutTime())}`
                : isRateLimited() 
                ? `Demasiados intentos. Espera ${formatTime(getRemainingTime())}`
                : "Inicia sesión en tu bóveda cuántica."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? 'border-destructive' : ''}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
              
              {errors.general && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" role="alert">
                  {errors.general}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitDisabled}
                aria-describedby="submit-status"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Iniciando...
                  </>
                ) : isAccountLocked() ? (
                  `Bloqueado (${formatTime(getRemainingLockoutTime())})`
                ) : isRateLimited() ? (
                  `Espera ${formatTime(getRemainingTime())}`
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
            
            {failedAttempts > 0 && !isAccountLocked() && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Intentos fallidos: {failedAttempts}/{SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 text-center">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                ¿No tienes una cuenta?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Regístrate
                </Link>
              </p>
              <div className="flex gap-4 justify-center">
                 <p>
                    <Link href="/forgot-password" className="text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                    </Link>
                </p>
                 <p>
                    <Link href="/recover-by-question" className="text-primary hover:underline">
                    Usar pregunta de seguridad
                    </Link>
                </p>
              </div>
            </div>
            
            {/* Credenciales de prueba en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p><strong>Credenciales de prueba:</strong></p>
                <p>Email: test@test.com</p>
                <p>Contraseña: password</p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
