import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ParkingCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase/config';

const SENA_GREEN = '#009e3d';
const SENA_DARK = '#007a30';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
  login,
  googleLogin,
  isAuthenticated
} = useAuth();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/app/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Acceso concedido');
        navigate('/app/dashboard');
      } else {
        toast.error('Credenciales inválidas');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleLogin = async () => {
  try {

    setLoading(true);

    const result =
      await signInWithPopup(auth, provider);

    googleLogin(result.user);

    toast.success(
      `Bienvenido ${result.user.displayName}`
    );

    navigate('/app/dashboard');

  } catch (error) {

    console.log(error);

    toast.error('Error con Google');

  } finally {

    setLoading(false);

  }
}; 

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Barlow', sans-serif",
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background:
            'linear-gradient(135deg, #001a0a 0%, #003d1a 60%, #006628 100%)',
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* Card */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: `3px solid ${SENA_GREEN}`,
            borderRadius: 4,
            padding: '2.5rem',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: SENA_GREEN,
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ParkingCircle size={28} color="#fff" />
            </div>

            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 32,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              <span style={{ color: SENA_GREEN }}>SENA</span> · ParkU
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#555',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginTop: 6,
              }}
            >
              Sistema de Parqueadero
            </div>
          </div>

          {/* Label */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,158,61,0.1)',
              border: '1px solid rgba(0,158,61,0.3)',
              borderRadius: 2,
              padding: '4px 10px',
              marginBottom: '1.5rem',
              fontSize: 11,
              fontWeight: 700,
              color: '#4ddb8a',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                background: '#4ddb8a',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />

            Acceso Institucional
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Correo Electrónico
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sena.edu.co"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  color: '#e8e8e8',
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = SENA_GREEN)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    'rgba(255,255,255,0.08)')
                }
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Contraseña
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    color: '#e8e8e8',
                    fontSize: 14,
                    fontFamily: "'Barlow', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = SENA_GREEN)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      'rgba(255,255,255,0.08)')
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: 12,
                  color: SENA_GREEN,
                  textDecoration: 'none',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#333' : SENA_GREEN,
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: 4,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.background =
                    SENA_DARK;
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.background =
                    SENA_GREEN;
              }}
            >
              {loading
                ? 'Verificando...'
                : 'Iniciar Sesión'}
            </button>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                background: '#fff',
                color: '#111',
                border: 'none',
                padding: '12px',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: 18, height: 18 }}
              />

              Continuar con Google
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: 0.5,
              }}
            >
              Usa cualquier correo y contraseña para acceder
              al demo
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: 11,
            color: '#ffffff',
            letterSpacing: 1,
          }}
        >
          © 2026 SENA — Servicio Nacional de Aprendizaje
        </p>
      </div>
    </div>
  );
}