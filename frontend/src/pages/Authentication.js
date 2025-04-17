import { redirect, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

import AuthForm from '../components/AuthForm';

function AuthenticationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get the mode (either 'login' or 'signup')
  const mode = searchParams.get('mode');

  // On initial render, if no mode is present, set it to 'login'
  useEffect(() => {
    if (!mode) {
      setSearchParams({ mode: 'login' });
    }
  }, [mode, setSearchParams]);

  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
 
  if (mode !== 'login' && mode !== 'signup') {
    throw new Response(JSON.stringify({ message: 'Unsupported mode.' }, { status: 422 }));
  }

  const data = await request.formData();
  const authData = {
    email: data.get('email'),
    password: data.get('password')
  };

  const response = await fetch('http://localhost:5000/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authData)
  });

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Could not authenticate user.' }, { status: 500 }));
  }

  const resData = await response.json();
  const token = resData.token;

  localStorage.setItem('token', token);
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  localStorage.setItem('expiration' + expiration.toISOString());

  return redirect('/');
}